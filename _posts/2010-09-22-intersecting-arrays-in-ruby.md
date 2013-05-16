---
layout: post
title: Intersecting Arrays in Ruby
published: true
tags:
- ruby
---
Just found a slightly satisfying approach to checking the contents of an array in ruby.

I like using [ `Array#include?` ](http://ruby-doc.org/core/classes/Array.html#M002203 "Array#include?") to figure out whether or not my given array has a certain entry. Unfortunately, if you want to check if an array has a set of possible values, such as, does it contain `:a` _or_ `:b` , you can't just pass an array of those values. Let me show you what I mean:

{% highlight ruby %}
  food = [:milk, :bread, :butter]
  food1 = [[:milk, :bread], :butter]
  expected = [:milk, :bread]
  food.include?(:milk) # => true
  food.include?(expected) # => false
  food1.include?(expected) # => true
{% endhighlight %}

In other words, `include?` is very specific about the way it does the matching. But what if I want `food.include?(expected)` to tell me if `food` has any of `expected` 's values? Enter [ `Array#&` ](http://ruby-doc.org/core/classes/Array.html#M002212 "Array#&"). It doesn't make `include?` do anything different, but does give us a simple way to get this newer behavior:

{% highlight ruby %}
  food = [:milk, :bread, :butter]
  expected = [:milk, :bread]
  (food & expected).size > 0 # => true
{% endhighlight %}

[ `Array#&` ](http://ruby-doc.org/core/classes/Array.html#M002212 "Array#&") gets the intersection of two arrays (the values that are present in both) and returns a new array containing only those values. You could add this to any `Array` instance by simply defining your own `include_any?` method:

{% highlight ruby %}
  # myapp/lib/ext/array.rb

  class Array
    def include_any? values
      (self & values).size > 0
    end

    def include_all? values
      (self & values).size == values.size
    end
  end

  [:milk, :bread, :butter].include_any?([:milk, :butter]) # => true
  [:milk, :bread, :butter].include_all?([:milk, :butter]) # => false
  [:milk, :bread, :butter].include_all?([:milk, :butter, :bread]) # => true
{% endhighlight %}

I cheated and gave you an `include_all?` method also, which just ensures that all of the expected values are present.

I could've used [ `Enumerable#any?` ](http://ruby-doc.org/core/classes/Enumerable.html#M003132 "Enumerable#any?") but then we'd have to use a block and still use [ `Array#include?` ](http://ruby-doc.org/core/classes/Array.html#M002203 "Array#include?"). This way, we're golden.

**What cool things have you done with ruby today?**

