---
layout: post
title: Four Things You Should Know About Ruby Methods
published: true
tags:
- methods-and-functions
- ruby
---
Just wanted to jot down some of the really cool things I've learned aout the way you can call methods in ruby. I may end up expanding this post into four separate posts with more info if need be, but for now I'll try to keep this short.

### 1. Default values

When defining a method with parameters, inevitably you'll find that it can prove useful to have some of the params revert to a default value if no value is passed. Other languages like python and php give you similar conventions when providing the parameter list to a method.

To use default values, simply use an equals sign after the parameter name, followed by the default parameter you wish to use. Note however, that while not all params need have a default value assigned, all params that _do_ have defaults must go at the end of the parameter list.

{% highlight ruby %}
  # Invalid method definition. Either from_date must be at the end of the method list, or to_date must have a default value
  def back_to_the_future(from_date=1985, to_date)
    puts "From Date: #{from_date}"
    puts "To Date: #{to_date}"
  end

  # Valid method definition
  def back_to_the_future(from_date=1985, to_date=1955)
    puts "From Date: #{from_date}"
    puts "To Date: #{to_date}"
  end

  back_to_the_future
  # => 1985
  # => 1955

  back_to_the_future 2010
  # => 2010
  # => 1955

  back_to_the_future 2010, 2000
  # => 2010
  # => 2000
{% endhighlight %}

Pretty simple, but hey, maybe you didn't know.

### 2. "Named Parameters" using the special hash parameter

Python, Objective-C, and various other languages have an interesting syntax for method arguments where you can name an argument beyond the scope in which the method is defined. These named parameters give you the ability to assign values to method arguments in an arbitrary order, since you are assigning a value to a specific parameter by that parameters name.

While ruby doesn't have Named Parameter syntax built in, there is one way to gain something very similar, and it has to do with Ruby Hashes. Ruby's hash syntax has a very simple, minimalist style that I really like, especially in Ruby 1.9. The interesting thing about using the hash parameter as a "named parameter" or "variable-length" argument, is that there is no syntactic sugar needed when defining the method. All the interesting work goes on while calling the method.

{% highlight ruby %}
  def back_to_the_future(options)
    puts "From #{options[:from]} to #{options[:to]}"
  end

  back_to_the_future :from => 1985, :to => 1955
  # => From 1985 to 1955

  back_to_the_future :to => 1985, :from => 1955
  # => From 1955 to 1985

  back_to_the_future :with_doc => false
  # => From to
{% endhighlight %}

Notice here that we didn't have to include the open and close curly braces usually present in a hash definition. You can put them in if you'd like, but sometimes it's more confusing to see it that way (what with block syntax using curly braces or the `do...end` syntax).

You can still have regularly defined parameters with or without defaults in the parameter list, just make sure they come before the expected hash collection.

{% highlight ruby %}
  def back_to_the_future(from_date, to_date, options) ... end

  def back_to_the_future(from_date, to_date=1955, options) ... end

  def back_to_the_future(from_date, to_date=1955, options={}) ... end
{% endhighlight %}

You've probably noticed by now that rails does this _all over the place_.

### 3. Variable-length arguments using the special array parameter

While named-parameters is nice for passing a list of configuration options to a method, sometimes you just want a method to accept any number of arguments, such as a logger method that can take any number of log messages and log them independent of each other. Ruby has another parameter condensing technique where all parameters passed that do not map to pre-defined arguments get collected into their own special array parameter, that is, if you ask for it. Defining a method in this way, you simply place a parameter at the end of the parameter list with an asterisk ( `*` ) preceding the parameter name.

{% highlight ruby %}
  def back_to_the_future(from_date, to_date, *people)
    puts "Who's coming?"
    people.each {|person| puts person }
  end

  back_to_the_future 1985, 1955, 'Marty', 'Doc', 'Biff'

  # => Who's Coming?
  # => Marty
  # => Doc
  # => Biff
{% endhighlight %}

Also worth noting is that the parameters collected do not need to be of one type like Java forces you to be. One could be a string, the next a number, the next a boolean. Whether or not that is a good design for your method is another story.

This style of parameter definition can be mixed with all the styles we've discussed so far, just remember the order things go: Regular params, Regular params with defaults, a Hash-collected param (if any), and finally the Array-collected params (where the param is preceded with an asterisk).

{% highlight ruby %}
  def back_to_the_future(from_date, to_date=1955, delorean_options={}, *people)
    # ...
  end

  back_to_the_future 1985, :use_flux_capacitor => true, :bring_back_george => false, 'Marty', 'Doc'
{% endhighlight %}

### 4. Saving the best for last: Blocks!

Arguably the most powerful feature that Ruby boasts is the ability to send an anonymous function to a method to be executed by the method in whatever way it was designed. Ruby calls these anonymous code blocks just that, **blocks**. In other contexts you might hear them called lambda's, procs, or simply anonymous function. You've probably already used blocks a ton in your ruby code, but what exactly are they for, and how can you use them in your own code?

Virtually every class in ruby's core make use of blocks to basically extend the language's abilities without having to add more syntactic sugar. Take for instance iterating over an array, the conventional way with a for loop, and ruby's more idiomatic way, with the `each` and it's associated block.

{% highlight ruby %}
  people = ['Marty', 'Doc', 'Biff']

  for person in people
    puts person
  end

  people.each do |person|
    puts person
  end
{% endhighlight %}

The first example uses ruby's syntax sugar to run the loop, printing out each entry in the people array. The second calls the `each` method on the people array, passing it a block. `Array#each` can and likely will run it's own code before or after invoking the block. As a developer outside looking in, it doesn't really matter to me what `each` does, so long a it calls my block for each element in the array. If we were to write a simplification of what ruby is doing in the background, it'd probably look something like this:

{% highlight ruby %}
  def each
    for e in self
      yield e
    end
  end
{% endhighlight %}

But wait a minute, isn't that what we wrote in our first example without the block? Indeed, it's very similar. Where our block example differs is that we have the ability to pass an anonymous block of code to the `each` method. When `each` is ready to call our block, it invokes yield, passing the argument applicable, in this case the `e` variable. In other words, `each` is handling the iteration for us, allowing us to focus on what matters more, the code being run for each iteration.

Syntactically, the big things to jot down with defining your methods to accept blocks are as follows:

- All methods implicitly may receive a block as an argument.
- If you want to name this argument, for whatever reason, it must be last in the argument list, and preceded by an ampersand `&amp;` .
- Just as all methods implicitly may receive a block, you can always check in a given method if a block was given, by calling `block_given?` .
- TO invoke a block, simply call the yield method, passing any paramters your block may be expecting
- Alternatively, if you have named the block, say `&func` , treat it as a lambda or proc that is passed to you (because that's what _was_ passed), using the built-in `call` method available to procs: `func.call(some_param)` .

{% highlight ruby %}
  def back_to_the_future(*people, &cool_block_name)
    puts "We're going back to the future with..."
    people.each do |person|
      cool_block_name.call(person)
    end
  end

  back_to_the_future 'Marty', 'Doc', 'Biff' do |person|
    puts person
  end

  # => We're going back to the future with...
  # => Marty
  # => Doc
  # => Biff
{% endhighlight %}

All of these examples are obviously contrived, but I hope it sheds some light on some really cool things you can do in ruby with simple method definitions. I'll likely be doing more posts with blocks, procs, and lambda's in the future, since they are definitely the most powerful tools in the shed (as far as methods go), so look for those sometime in the near future.

Please let me know if you find any omissions or errors in the above examples and explanations. Happy Coding!

