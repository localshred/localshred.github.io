all: build

build:
	bundle exec jekyll build

server:
	bundle exec jekyll serve -w

.PHONY: build server
