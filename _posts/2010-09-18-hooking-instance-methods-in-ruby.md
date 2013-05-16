---
layout: post
title: Hooking Instance Methods in Ruby
published: true
tags:
- hooks
- meta-programming
- ruby
---
Everyone and their dog is familiar with ActiveRecord-style callbacks, you know, the kind where you specify you want a particular method or proc to be run before or after a given event on your model. It helps you enforce the principles of code ownership while making it trivial to do the hardwiring, ensuring that code owned by the model is also managed by the model.

I love this kind of programming and recently found that I needed some similar functionality in a particular class, one that wasn't tied to Active_[Insert your railtie here]_. My case was different in that I knew that _any_ class inheriting from a particular base, which we'll call `HookBase` , needed a hardwired hook for every method defined, functionality that needed to run for virtually every instance method call. The following example illustrates my need:

{% highlight ruby %}
  class HookBase
    def hardwired_hook
      # functionality every method needs
    end
  end

  class MyClass < HookBase
    def find_widget
      # needs setup/teardown help from HookBase
    end
  end
{% endhighlight %}

So, operating from the idea that every instance method extending classes implement should have default wrap-around behavior, I got to work. First off, you need to know that ruby has built-in lifecycle hooks on your classes, objects, and modules. Things like `included` and `extended` and `method_added` help you hook in to your code to ensure that the appropriate things are happening on your classes, objects, and modules. So in my case, I needed to know when a method was added to `HookBase` (or one of its children) so that I could appropriately tap into that code.

`method_added` is where the meat of the solution lies. When a method is added, ruby fires the `method_added` call on the object (if any exists), passing it the name of the new method. Keep in mind that this happens _after_ the method has already been created, which is crucial to this solution. We'll next create a new name from the old name, prepended with some identifier (in this case we chose "hide\_").

We'll need to check the `private_instance_methods` array for already defined method names to ensure we're not duplicating our effort (or clobbering someone elses), as well as checking our own array constant for methods we don't want to hook. Remember that `method_added` will be called on every method that is found for HookBase as well as children. I found that there were HookBase methods I had implemented that were supporting this behavior and didn't need to be hardwired, so I added this to my list of methods to ignore.

If we've made it this far, go ahead and alias the old method to the new one, then privatize the new one. Now we can safely redefine the old method without destroying the code it contained. We also now know that no one (except self) can invoke the private method directly, they'll have to implicitly go through the HookBase first.

Redefining the old method is as simple as using `define_method` and calling our `hardwired_hook` method within, passing our `new_method` (which is privatized), and the old method (for convenience), and any associated arguments and blocks.

The final implementation looks something like this:

{% highlight ruby %}
  class HookBase
    class << self
      NON_HOOK_METHODS = %w( hardwired_hook some_other_method )

      def method_added old
        new_method = :"hide_#{old}"
        return if (private_instance_methods & [old, new_method]).size > 0 or old =~ /^hide_/ or NON_HOOK_METHODS.include?(old.to_s)
        alias_method new_method, old
        private new_method
        define_method old do |*args, &block|
          hardwired_hook new_method.to_sym, old.to_sym, *args, &block
        end
      end
    end

    private

    # Hardwired handler for all method calls

    def hardwired_hook new_method, old_method, args*, &block
      # perform any before actions
      puts 'doing stuff before method call...'
      # Invoke the privatized method
      __send__ new_method, *args, &block
      # perform any after actions
      puts 'doing stuff after the method call...'
    end
  end

  class MyClass < HookBase
    def find_widget
      puts 'finding widget...'
    end
  end

  MyClass.new.find_widget
  # doing stuff before method call...
  # finding widget...
  # doing stuff after the method call...
{% endhighlight %}

The great thing about this approach is you may not even care about hardwiring anything, but just want to provide hooking functionality. If that's the case, simply define a class method in HookBase to register a hook (such as `before` or `after` ), optionally accepting an `:only` or `:except` list of methods. Internally store the blocks passed and invoke them in the `hardwired_hook` method either before or after the method call.

Let me know if you have any comments or different approaches. Happy hacking!

**UPDATE**: Forgot that `method_added` needs to be defined in `class << self` to work properly. Also updated to use the `Array#&` intersection method I described in [Intersecting arrays in ruby]({% post_url 2010-09-22-intersecting-arrays-in-ruby %}) instead of using `Array#include?` .

