---
layout: post
title: Git Pre-receive Hook for Rejecting a Bad Gemfile
published: true
tags:
- bundler
- gemfile
- git
- hooks
---
[Bundler](http://gembundler.com "Bundler") has a cool facility with `Gemfile` s that allow you to specify some fine-grained options for a given gem beyond specifying a version. Things like `:path` , `:branch` , `:git` , and `:tag` . All of those things are neat for development, but horrible for production. I wanted a way to reject pushes to a repo if the Gemfile was changed to include any one of those options, and a git pre-receive hook was just the tonic.

{% highlight ruby %}
  #!/usr/bin/env ruby

  BRANCHES = %w( master stable )
  REJECT_OPTIONS = %w( git tag branch path )

  old_sha, new_sha, ref = STDIN.read.split(' ')
  exit 0 unless BRANCHES.include?(ref.split('/').last)
  diff = %x{ git diff-index --cached --name-only #{old_sha} 2> /dev/null }
  diff = diff.split("\n") if diff.is_a?(String)

  if diff.detect{|file| file =~ /^Gemfile$/}
    tree = %x{ git ls-tree --full-name #{new_sha} Gemfile 2> /dev/null }.split(" ")
    contents = %x{ git cat-file blob #{tree[2]} 2> /dev/null }
    invalid_lines = contents.each_line.select do |line|
      line =~ /\b(#{REJECT_OPTIONS.join('|')})\b/
    end

    unless invalid_lines.empty?
      puts
      puts '> !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
      puts '> ---- PUSH REJECTED by origin ----'
      puts '>'
      puts "> You've specified an invalid option for #{invalid_lines.size} gem definitions in the Gemfile"
      puts "> Invalid options are: #{REJECT_OPTIONS.join(', ')}"
      puts '>'
      puts "> The offending gems:"
      puts ">\t" + invalid_lines.join(">\t")
      puts '>'
      puts '> To fix:'
      puts ">\t* Remove the offending options"
      puts ">\t* bundle install"
      puts ">\t* Run tests"
      puts ">\t* Ammend previous commit (git add . && git commit --amend)"
      puts ">\t* git push origin #{ref.split('/').last}"
      puts '>'
      puts '> !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
      puts
      exit 1
    end
  end
{% endhighlight %}

The script above monitors pushes to the "master" and "stable" branches (our development and production lines, respectively). It checks to see if the Gemfile was listed in the new commit file list, then parses the blob of the Gemfile for any of the offending options. Each offending line is then output back to the pushing developer with instructions on how to fix his/her Gemfile and how to amend the commit. Here's what the output looks like:

{% highlight sh %}
  $ git push origin master
  Counting objects: 5, done.
  Delta compression using up to 8 threads.
  Compressing objects: 100% (3/3), done.
  Writing objects: 100% (3/3), 362 bytes, done.
  Total 3 (delta 0), reused 0 (delta 0)
  Unpacking objects: 100% (3/3), done.
  remote:
  remote: > !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  remote: > ---- PUSH REJECTED by origin ----
  remote: >
  remote: > You've specified an invalid option for 2 gem definitions in the Gemfile
  remote: > Invalid options are: git, tag, branch, path
  remote: >
  remote: > The offending gems:
  remote: > gem 'utilio', :git => 'git@github.com:localshred/utilio.git'
  remote: > gem 'rails', :git => 'git@github.com:rails/rails.git'
  remote: >
  remote: > To fix:
  remote: > * Remove the offending options
  remote: > * bundle install
  remote: > * Run tests
  remote: > * Ammend previous commit (git add . && git commit --amend)
  remote: > * git push origin master
  remote: >
  remote: > !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  remote:

  To git@git.mycompany.com:repo1.git
  ! [remote rejected] master -> master (pre-receive hook declined)
  error: failed to push some refs to 'git@git.mycompany.com:repo1.git'
{% endhighlight %}

It's also worth noting that since this is a pre-receive hook, when returning an exit status of anything but 0, git will reject merging the commits. This is good because we don't want "bad code" in our repo. You could also use this to do other checking measures, such as running a CI build or syntax checks.

To use the above hook, simply copy the script above into the `./hooks/pre-receive` file in your origin repo. Be sure to `chmod +x ./hooks/pre-receive` otherwise git won't be able to invoke the script when a new push occurs. We have ~15 repos that I manage at work that I want to use the hook on, so I just kept the file out on the git user's home directory and symlinked it back to each repos hooks directory. Same results, just easier to manage if I need to make a quick change to the hook.

Happy coding.

