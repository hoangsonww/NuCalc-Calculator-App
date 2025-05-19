# ruby/nucalc_pro.gemspec
Gem::Specification.new do |s|
  s.name        = "nucalc_pro"
  s.version     = "1.0.0"
  s.summary     = "NuCalc Pro API service (Sinatra + Mongoid + JWT)"
  s.description = "A backend API for NuCalc Pro, providing history, user profiles, and advanced calculation logging."
  s.authors     = ["Son Nguyen"]
  s.email       = ["hoangson091104@gmail.com"]
  s.homepage    = "https://github.com/hoangsonww/NuCalc-Calculator-App"
  s.license     = "MIT"

  # which files go into your gem
  s.files       = Dir.chdir(File.expand_path(__dir__)) do
    Dir[
      "app/**/*.rb",
      "config/**/*.yml",
      "initializers/**/*.rb",
      "app.rb",
      "config.ru",
      "Gemfile*",
      "Dockerfile",
      ".env.example"
    ]
  end

  s.required_ruby_version = ">= 2.7.0"

  # runtime dependencies
  s.add_dependency "sinatra",   "~> 2.1"
  s.add_dependency "mongoid",   "~> 7.3"
  s.add_dependency "jwt",       "~> 2.6"
  s.add_dependency "rack-cors", "~> 1.1"

  # link to the GitHub repo
  s.metadata = {
    "github_repo" => "https://github.com/hoangsonww/NuCalc-Calculator-App"
  }
end
