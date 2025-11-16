require 'sinatra'
require 'mongoid'
require 'json'
require 'jwt'
require 'bcrypt'
require 'rack/cors'

use Rack::Cors do
  allow do
    # Only allow specific origins in production - configure via environment variable
    origins ENV.fetch('ALLOWED_ORIGINS', 'http://localhost:4260').split(',')
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :delete, :options],
      credentials: true,
      max_age: 600
  end
end

Mongoid.load!('config/mongoid.yml', settings.environment)

# Secret for JWT - MUST be set in production
JWT_SECRET = ENV.fetch('JWT_SECRET') do
  if settings.production?
    raise 'JWT_SECRET environment variable must be set in production'
  else
    warn 'WARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable for production.'
    'dev_secret_only_not_for_production'
  end
end

# Models
class User
  include Mongoid::Document
  include Mongoid::Timestamps

  field :email, type: String
  field :password_hash, type: String

  index({ email: 1 }, { unique: true, name: 'email_index' })

  def password=(new_password)
    self.password_hash = BCrypt::Password.create(new_password)
  end

  def authenticate(password)
    BCrypt::Password.new(password_hash) == password
  end
end

class Calculation
  include Mongoid::Document
  include Mongoid::Timestamps

  field :user_id,    type: BSON::ObjectId
  field :expression, type: String
  field :result,     type: Float
end

class Preference
  include Mongoid::Document
  include Mongoid::Timestamps

  field :user_id,   type: BSON::ObjectId
  field :theme,     type: String, default: 'light'
  field :precision, type: Integer, default: 2
end

helpers do
  def json_params; JSON.parse(request.body.read); end

  def protected!
    token = request.env['HTTP_AUTHORIZATION']&.slice(/Bearer (.+)$/i, 1)
    halt 401, { error: 'Token missing' }.to_json unless token
    payload = JWT.decode(token, JWT_SECRET, true, algorithm: 'HS256').first
    @current_user = User.find(payload['uid'])
  rescue
    halt 401, { error: 'Invalid token' }.to_json
  end

  # Safe mathematical expression evaluator
  # Only allows numbers, basic operators, parentheses, and whitespace
  def safe_calculate(expression)
    # Remove all whitespace
    expr = expression.gsub(/\s+/, '')

    # Validate expression only contains allowed characters
    unless expr.match?(/\A[\d\+\-\*\/\.\(\)]+\z/)
      halt 400, { error: 'Invalid expression: only numbers and operators (+, -, *, /, parentheses) are allowed' }.to_json
    end

    # Check for balanced parentheses
    paren_count = 0
    expr.each_char do |char|
      paren_count += 1 if char == '('
      paren_count -= 1 if char == ')'
      halt 400, { error: 'Invalid expression: unbalanced parentheses' }.to_json if paren_count < 0
    end
    halt 400, { error: 'Invalid expression: unbalanced parentheses' }.to_json if paren_count != 0

    # Prevent division by zero at the string level
    halt 400, { error: 'Division by zero is not allowed' }.to_json if expr.match?(/\/0(?!\d)/)

    # Limit expression length to prevent DoS
    halt 400, { error: 'Expression too long (max 200 characters)' }.to_json if expr.length > 200

    # Use a safer evaluation method - convert to Ruby syntax and evaluate in restricted context
    # This is still using eval but with strict validation
    # For production, consider using a proper math expression parser gem like 'dentaku'
    begin
      result = eval(expr, nil, __FILE__, __LINE__)
      halt 400, { error: 'Result is not a valid number' }.to_json unless result.is_a?(Numeric)
      halt 400, { error: 'Result overflow' }.to_json if result.infinite? || result.nan?
      result.to_f
    rescue ZeroDivisionError
      halt 400, { error: 'Division by zero' }.to_json
    rescue SyntaxError, StandardError => e
      halt 400, { error: "Invalid expression: #{e.message}" }.to_json
    end
  end
end

before do
  content_type 'application/json'
end

# Auth
post '/signup' do
  data = json_params

  # Input validation
  halt 400, { error: 'Email is required' }.to_json unless data['email']
  halt 400, { error: 'Password is required' }.to_json unless data['password']
  halt 400, { error: 'Email must be a string' }.to_json unless data['email'].is_a?(String)
  halt 400, { error: 'Password must be a string' }.to_json unless data['password'].is_a?(String)

  email = data['email'].strip.downcase
  password = data['password']

  # Email format validation
  halt 400, { error: 'Invalid email format' }.to_json unless email.match?(/\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i)

  # Password strength validation
  halt 400, { error: 'Password must be at least 8 characters' }.to_json if password.length < 8
  halt 400, { error: 'Password is too long (max 128 characters)' }.to_json if password.length > 128

  user = User.new(email: email)
  user.password = password
  halt 422, { error: user.errors.full_messages }.to_json unless user.save

  token = JWT.encode({ uid: user.id.to_s, exp: Time.now.to_i + 86400 }, JWT_SECRET, 'HS256')
  { token: token, user: { id: user.id.to_s, email: user.email } }.to_json
rescue Mongoid::Errors::Validations => e
  halt 422, { error: e.message }.to_json
end

post '/login' do
  data = json_params

  # Input validation
  halt 400, { error: 'Email is required' }.to_json unless data['email']
  halt 400, { error: 'Password is required' }.to_json unless data['password']

  email = data['email'].strip.downcase
  password = data['password']

  user = User.find_by(email: email)
  halt 401, { error: 'Invalid credentials' }.to_json unless user&.authenticate(password)

  token = JWT.encode({ uid: user.id.to_s, exp: Time.now.to_i + 86400 }, JWT_SECRET, 'HS256')
  { token: token, user: { id: user.id.to_s, email: user.email } }.to_json
end

# Calculation endpoint
post '/calculate' do
  protected!
  data = json_params

  # Validate input
  halt 400, { error: 'Expression is required' }.to_json unless data['expression']
  halt 400, { error: 'Expression must be a string' }.to_json unless data['expression'].is_a?(String)

  expr = data['expression'].strip
  halt 400, { error: 'Expression cannot be empty' }.to_json if expr.empty?

  # Use safe calculator instead of eval
  result = safe_calculate(expr)

  calc = Calculation.create!(user_id: @current_user.id, expression: expr, result: result)
  { id: calc.id.to_s, expression: expr, result: result }.to_json
rescue Mongoid::Errors::Validations => e
  halt 422, { error: e.message }.to_json
end

get '/history' do
  protected!
  Calculation.where(user_id: @current_user.id)
             .order_by(created_at: :desc)
             .map { |c| { id: c.id.to_s, expr: c.expression, result: c.result, at: c.created_at } }
             .to_json
end

# Preferences
get '/prefs' do
  protected!
  pref = Preference.find_or_create_by(user_id: @current_user.id)
  { theme: pref.theme, precision: pref.precision }.to_json
end

put '/prefs' do
  protected!
  data = json_params

  # Input validation
  if data['theme']
    halt 400, { error: 'Theme must be a string' }.to_json unless data['theme'].is_a?(String)
    allowed_themes = %w[light dark cocoa high-contrast]
    halt 400, { error: "Invalid theme. Allowed: #{allowed_themes.join(', ')}" }.to_json unless allowed_themes.include?(data['theme'])
  end

  if data['precision']
    halt 400, { error: 'Precision must be a number' }.to_json unless data['precision'].is_a?(Integer)
    halt 400, { error: 'Precision must be between 0 and 10' }.to_json unless (0..10).include?(data['precision'])
  end

  pref = Preference.find_or_create_by(user_id: @current_user.id)
  update_data = {}
  update_data[:theme] = data['theme'] if data['theme']
  update_data[:precision] = data['precision'] if data['precision']

  pref.update!(update_data) unless update_data.empty?
  { success: true, preferences: { theme: pref.theme, precision: pref.precision } }.to_json
rescue Mongoid::Errors::Validations => e
  halt 422, { error: e.message }.to_json
end
