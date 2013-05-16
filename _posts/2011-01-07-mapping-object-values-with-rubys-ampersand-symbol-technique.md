---
layout: post
title: Mapping Object Values With Ruby's Ampersand-symbol Technique
published: true
tags:
- procs
- ruby
---
Discovered another little Ruby nugget the other day. The nugget gives a shorter syntax when you want to map the return value of a message sent to a list of objects, say, the name of the class of the object. In the past I would use `Array#map` to produce the list with something like:

{% highlight ruby %}
  objects = [1, :number_1, "1"]
  classes = objects.map { |o| o.class }
  classes.inspect
  # => [Fixnum, Symbol, String]
{% endhighlight %}

Turns out that Ruby has a shortcut that shortens your keystrokes a bit:

{% highlight ruby %}
  objects = [1, :number_1, "1"]
  classes = objects.map(&:class)
  classes.inspect
  # => [Fixnum, Symbol, String]
{% endhighlight %}

The two snippets are functionally identical. By passing a symbol to map preceded by an ampersand, Ruby will call `Symbol#to_proc` on the passed symbol (e.g. `:class.to_proc` ), which returns a proc object like `{|o| o.class }` . Where would you use this you ask? The day I learned this little ditty I was writing some tests that were verifying some active record associations. Whenever I needed to update values on a `has_many` collection for a particular model, I actually needed to assert that the associated collection of objects were rebuilt with the new values, deleting the old rows and recreating new ones. The ampersand-symbol technique above was nice for this.

{% highlight ruby %}
  describe Father do
    it 'should create new children when I attempt to update the children' do
      father = Factory(:father)
      orig_children = father.children.map(&:id)
      # perform the update method
      father.reload
      father.children.map(&:id).should\_not == orig\_children
    end
  end
{% endhighlight %}

So I thought I'd pass the word on. **Cool stuff in Ruby.** Who knew?

