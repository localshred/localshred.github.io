source "https://rubygems.org"

# See http://jekyllrb.com/docs/github-pages/
require "json"
require "open-uri"
versions = JSON.parse(open("https://pages.github.com/versions.json").read)

gem "github-pages", versions["github-pages"]

# Plugins and extensions
gem "jekyll-maps", "~> 2.0", ">= 2.0.4"
gem "redcarpet", "~> 3.4"
gem "rouge", "~> 2.2.1"
