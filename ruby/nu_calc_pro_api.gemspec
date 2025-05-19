Gem::Specification.new do |s|
  s.name        = "nucalc_pro_api"
  s.version     = "1.0.0"
  s.summary     = "NuCalc Pro backend API (Sinatra + Mongoid + JWT)"
  s.description = "A modern API for NuCalc Pro: eval, history, user prefs, auth."
  s.authors     = ["Son Nguyen"]
  s.email       = ["hoangson091104@gmail.com"]
  s.homepage    = "https://github.com/hoangsonww/NuCalc-Calculator-App"
  s.license     = "MIT"
  s.files       = Dir.glob("{app.rb,config.ru,Gemfile*,*.gemspec,config/**/*,*.example}")
  s.required_ruby_version = ">= 2.7.0"
  s.add_runtime_dependency "sinatra", "~> 2.1"
  s.add_runtime_dependency "mongoid", "~> 7.3"
  s.add_runtime_dependency "jwt",     "~> 2.6"
  s.add_runtime_dependency "bcrypt",  "~> 3.1"
  s.add_runtime_dependency "rack-cors", "~> 1.1"
end
