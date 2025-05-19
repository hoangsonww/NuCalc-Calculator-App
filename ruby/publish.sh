#!/usr/bin/env bash
set -euo pipefail

: "\${GH_TOKEN:?export GH_TOKEN to a PAT with read:packages, write:packages}"

mkdir -p ~/.gem
cat > ~/.gem/credentials <<EOC
---
:github: Bearer \$GH_TOKEN
EOC
chmod 0600 ~/.gem/credentials

gem build nu_calc_pro_api.gemspec
gem push --key github --host https://rubygems.pkg.github.com/hoangsonww nu_calc_pro_api-1.0.0.gem
