---
layout: post
title: Variable-length Method Arguments in Ruby
published: true
tags:
- methods
- ruby
- variable-length-arguments
---
In yesterday's post regarding the [four things you should know about ruby methods]({% post_url 2010-06-01-four-things-you-should-know-about-ruby-methods %} "Four things you should know about ruby methods"), I covered some basics about ruby method definitions. For this post, I just wanted to go into a little more detail here with some of the things I left off the table that came to me later.

### Variable-length arguments

Number three on our list of things you should know, we talked about **variable-length arguments**, also known as **the array-collected parameter**. At least, that's what I call it... sometimes. This cool feature allows you to pass any number of arguments to a ruby method and have all the unmapped parameters get collected into a single parameter which becomes an array of the values that were passed. Whew! That was a mouthful.

{% highlight ruby %}
  def log_all(*lines)
    lines.each{|line| @logger.info(line)}
  end

  log_all 'foo', 'bar', 'baz', 'qux'

  # File: logs/your_log_file.log
  # foo
  # bar
  # baz
  # qux
{% endhighlight %}

This is neat, no doubt, but what if you don't want to specify each value individually to the array-collected parameter in the method call? Say for instance, in the previous example, I already had the values `'foo'` , `'bar'` , `'baz'` , and `'qux'` in an array. Ruby allows you to pass the array through as a pre-collected array of values. The only thing to do is pass the array as a single parameter, prefixed by an asterisk ( `*` ).

{% highlight ruby %}
  def log_all(*lines)
    lines.each{|line| @logger.info(line)}
  end

  # values are predefined
  values = ['foo', 'bar', 'baz', 'qux']

  # Don't forget the asterisk!
  log_all *values
{% endhighlight %}

If you were to indeed forget the asterisk before the values array being passed, `log\_all` 's lines parameter would still be an array, but would only contain one element: the array you passed. So in order to get to it you'd either have to flatten `lines` or call the `0th` index on it, which sort of defeats the purpose.

### Don't forget blocks, lambdas, and procs!

This array-collection technique to method parameter definition is not only confined to normal methods, but also to ruby's trio of anonymous function definitions: blocks, lambdas, and procs. Take the same example from above, with `log\_all` rewritten as a lambda.

{% highlight ruby %}
  log_all = lambda do |*lines|
    lines.each{|line| @logger.info(line)}
  end

  # values are predefined
  values = ['foo', 'bar', 'baz', 'qux']

  # Don't forget the asterisk!
  log_all.call *values
{% endhighlight %}

You can even do this with ActiveRecord [named\_scopes](http://api.rubyonrails.org/classes/ActiveRecord/NamedScope/ClassMethods.html "ActiveRecord named_scopes"), which is wicked cool.

{% highlight ruby %}
  class User < ActiveRecord::Base
    named_scope :with_names_like, lambda do |*names|
      { :conditions => names.collect{|name| "lower(name) like '%?%'"}.join(' OR ').to_a.push(names).flatten! }
    end
  end

  User.all.with_names_like 'jeff', 'jose', 'jill'

  # Creates a condition sql string like so:
  # WHERE (lower(name) like '%jeff%' OR lower(name) like '%jose%' OR lower(name) like '%jill%')
{% endhighlight %}

I'm interested to know what other ways you've come up with to use this technique. Please leave a comment below if you have any questions or examples of your own work.

