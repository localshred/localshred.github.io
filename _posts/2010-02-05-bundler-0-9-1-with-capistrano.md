---
layout: post
title: Bundler 0.9.1 With Capistrano
published: true
tags:
- bundler
- capistrano
- ruby
---
On my current project at work we're building a [Sinatra](http://sinatrarb.com "Sinatra, the ruby micro-framework") app. More specifically, we used the [Monk](http://monkrb.com "Monk the meta-glue framework built atop Sinatra") generator/glue meta-framework which is built atop Sinatra. When you generate a Monk app it automagically gives you a dependency/gem management system known as, fittingly, dependencies. This article isn't meant to knock dependencies (which I believe is written by the [CitrusByte](http://citrusbyte.com "CitrusByte development shop") guys, the creators of monk), but through some continuing issues with it we decided to find something else to handle that problem. That something we found was Yehuda's [Bundler](http://github.com/carlhuda/bundler "Bundler gem management system").

Bundler is really cool because it allows you to make all your gem management across all your development, testing, and production systems easy to handle. You define a `Gemfile` which references all the gems required to make your app go boom (in a good way). Once the file is defined simply run `bundle install` to ensure your system has all the necessary dependencies to run your app.

I created my bundler Gemfile 4 or 5 days ago, installed the dependencies, and then sort of left it alone for a while. Yesterday I wanted to deploy my app to production and so I went into my capistrano `deploy.rb` to update my recipe to handle the bundler stuff. Naturally, I needed bundler on the server, so I went and installed the gem. Little did I realize that in those few days Yehuda and Carl had updated the gemspec to a new version for bundler, moving from 0.8.x to 0.9.1. When you install the 0.9.x version it asks you to remove any pre-0.9 installations of bundler. **If you have an existing Bundler installation and want to upgrade, delete the old install _before_ you install the new.** Otherwise, your gem command will be broken. A lot of my headaches would have been alleviated had I just done that.

I found a few blog posts and gists that have bundler specific tasks for cap recipes, so I forked and modified them for your benefit. In order to get the magic of bundler for your app, use the following in your cap recipe:

{% highlight ruby %}
# ...

namespace :bundler do
  task :create_symlink, :roles => :app do
    shared_dir = File.join(shared_path, 'bundle')
    release_dir = File.join(current_release, '.bundle')
    run("mkdir -p #{shared_dir} && ln -s #{shared_dir} #{release_dir}")
  end

  task :bundle_new_release, :roles => :app do
    bundler.create_symlink
    run "cd #{release_path} && bundle install --without test"
  end

  task :lock, :roles => :app do
    run "cd #{current_release} && bundle lock;"
  end

  task :unlock, :roles => :app do
    run "cd #{current_release} && bundle unlock;"
  end
end

# HOOKS
after "deploy:update_code" do
  bundler.bundle_new_release
  # ...
end
{% endhighlight %}

Two points to notice:

1. We setup a hook to run after the deploy:update\_code task which will run the bundle install command to get any bundle updates. Bundler 0.9.1 comes with a nifty feature where you can lock your gem versions so that any calls to bundle install won't actually update anything.
2. We're also symlinking the .bundle directory that bundler creates for us into the shared folder. This is just a nicety so that bundler doesn't have to recreate that directory and it's environment.rb file everytime you release your code.

I hope this helps anyone out there who has upgraded their bundler versions. Happy bundling with capistrano. :)

