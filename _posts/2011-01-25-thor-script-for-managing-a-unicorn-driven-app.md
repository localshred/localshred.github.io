---
layout: post
title: Thor Script for Managing a Unicorn-driven App
published: true
tags:
- nginx
- rack
- ruby
- thor
- unicorn
---
Today I deployed a mini sinatra app on one of our test servers to manage some internal QA. I've put out quite a few apps backed by [Unicorn](http://unicorn.bogomips.org/ "Unicorn specification") in QA recently and finally wrote a little script to handle stopping, starting, and reloading of the unicorn processes. Nothing super special here, just thought I'd share a useful script. Drop the following code into your application's `tasks` directory, or place it on the app root and call it `Thorfile` .

### tasks/unicorn.thor (or Thorfile)

{% highlight ruby %}
  # put me in /path/to/app/tasks/unicorn.thor
  require 'thor'

  class UnicornRunner < Thor
    include Thor::Group
    namespace :unicorn

    UNICORN_CONFIG = "/path/to/app/config/unicorn.rb"
    RACKUP_FILE = "/path/to/app/config.ru"
    PID_FILE = "/path/to/app/tmp/application.pid"

    desc 'start', 'Start the application'
    def start
      say 'Starting the application...', :yellow
      `bundle exec unicorn -c #{UNICORN_CONFIG} -E production -D #{RACKUP_FILE}`
      say 'Done', :green
    end

    desc 'stop', 'Stop the application'
    def stop
      say 'Stopping the application...', :yellow
      `kill -QUIT $(cat #{PID_FILE})`
      say 'Done', :green
    end

    desc 'reload', 'Reload the application'
    def reload
      say 'Reloading the application...', :yellow
      `kill -USR2 $(cat #{PID_FILE})`
      say 'done', :green
    end
  end
{% endhighlight %}

### Usage

From your application root directory, run any of the three commands. Keep in mind you'll need a unicorn config file that actually dictates how [Unicorn](http://unicorn.bogomips.org/ "Unicorn specification") should behave (like number of workers, where your logs go, etc). You'll also need a [Rackup](http://rack.rubyforge.org/doc/SPEC.html "Rack specification") file ( `config.ru` ) which tells unicorn how to run your app.

{% highlight sh %}
  $ thor -T
  $ thor unicorn:start Start the application
  $ thor unicorn:stop Stop the application
  $ thor unicorn:reload Reload the application
  $ thor unicorn:start # starts the unicorn master
  $ thor unicorn:stop # sends the QUIT signal to master (graceful shutdown)
  $ thor unicorn:reload # sends the USR2 signal to master (graceful reload of child workers)
{% endhighlight %}

Plop this puppy behind [nginx](http://wiki.nginx.org/Main "Nginx web server") and you're golden. [Thor](https://github.com/wycats/thor "Thor scripting library of Ruby") has a lot more things you could do with this (like overriding which config file to use) by providing method-level options, but this is a great starting point for most people. Leave a comment if you have any improvements or other ways you handle this.

