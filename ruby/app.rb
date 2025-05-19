require 'sinatra'
require 'mongoid'
require 'json'
require 'jwt'
require 'bcrypt'
require 'rack/cors'

use Rack::Cors do
  allow do
    origins '*'
    resource '*', headers: :any, methods: [:get, :post, :put, :delete, :options]
  end
end

Mongoid.load!('config/mongoid.yml', settings.environment)

# secret for JWT
JWT_SECRET = ENV.fetch('JWT_SECRET') { 'super_secret_change_me' }

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
end

before do
  content_type 'application/json'
end

# Auth
post '/signup' do
  data = json_params
  user = User.new(email: data['email'])
  user.password = data['password']
  halt 422, { error: user.errors.full_messages }.to_json unless user.save
  token = JWT.encode({ uid: user.id.to_s, exp: Time.now.to_i + 86400 }, JWT_SECRET, 'HS256')
  { token: token }.to_json
end

post '/login' do
  data = json_params
  user = User.find_by(email: data['email'])
  halt 401, { error: 'Invalid credentials' }.to_json unless user&.authenticate(data['password'])
  token = JWT.encode({ uid: user.id.to_s, exp: Time.now.to_i + 86400 }, JWT_SECRET, 'HS256')
  { token: token }.to_json
end

# Calculation endpoint
post '/calculate' do
  protected!
  data = json_params
  expr = data['expression']
  # VERY simple eval — you may want a safer parser!
  result = eval(expr).to_f
  calc = Calculation.create!(user_id: @current_user.id, expression: expr, result: result)
  { id: calc.id.to_s, expression: expr, result: result }.to_json
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
  pref = Preference.find_or_create_by(user_id: @current_user.id)
  pref.update!(theme: data['theme'], precision: data['precision'])
  { success: true }.to_json
end
