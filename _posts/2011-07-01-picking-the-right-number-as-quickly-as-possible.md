---
layout: post
title: Binary Search in Ruby, or, "Picking the Right Number, as Quickly as Possible"
published: true
tags:
- algorithms
- binary-search
- funstuff
- ruby
---
So you're writing a parser in C that parses the lines of a file. The line you're parsing is made up of a 40 character key and any number of ip addresses after, space-separated. You need to know a max line length to read (because C is mean like that), but you're not sure how many ip's you can fit on a line for a given key.

Such was my case yesterday and decided to write a mini script in ruby to figure it out. My first stab was to iterate from 1 to 100 and checking the line lengths by literally building a line with x number of ip elements on the line. While the code was correct and produced the necessary information for the given inputs, it was horribly inefficient and so I decided to rewrite it to be smarter. Enter the [Binary search algorithm](http://en.wikipedia.org/wiki/Binary_search_algorithm "Binary Search Algorithm").

Using the binary search algorithm, we take a lower and an upper bound of possible elements and try to quickly guess which number is the highest possible without exceeding the line limit. So here's the concrete data we know. The line format (as described above) will look something like this:

{% highlight sh %}
  86f7e437faa5a7fce15d1ddcb9eaeaea377667b8 174.18.0.1 174.18.0.2 174.18.0.3 174.18.0.4 174.18.0.5 174.18.0.6
{% endhighlight %}

... with theoretically unlimited ips per line. The first value is a key we'll use to store the ips against in a lookup table, but don't worry about that right now. The key is generated using sha1 digesting, so we know it will always be 40 characters. The max length for any given ip address is 15 assuming all 4 blocks are at least valued at 100 (e.g. 100.100.100.100). Space-separating the key and x number of ips and your line length calculation is `f(x) = kl + (el*x) + x` where `x` is line length, `kl` is key length, and `el` is element length (ip address length). In other words, if we're testing 50 elements on the line, the line length would be `40 + (15*50) + 50` which equals `840` .

Now that we can arbitrarily calculate the length of a line based on the number of ip elements we want to test, we can start "guessing". This isn't guessing at all, we just split our possible range in half and use the middle ground to test the possible length. In other words, if my initial range is 1..100 (read as "anywhere from 1 ip element to 100 ip elements"), then our first test value for `x` above would be 50, which if you remember produces a line length of 840. I assumed that I'd be okay with a max line length of 1000 characters, and so we assert that if `len` is less than the max, then we can use the upper half of the range boundary, or `50..100` . If `len` was more than our max of 1000, we'd take the bottom half, or `1..50` .

Using this technique recursively we can whittle down to the exact number of ip elements that can be inserted on a line before we go over the limit of 1000 characters on the line, which happens to be 60. You know you're done checking when your range is only one element apart, in this case 60..61. With my first solution to iterate up from 1 to 100, this meant we had to check 61 times before we knew we were over the limit. **With this new range, we actually only needed 8 iterations!** Very cool how "guessing" can solve the problem quite nicely.

{% highlight sh %}
  require 'digest/sha1'

  @k_len = Digest::SHA1.hexdigest('a').size # 40
  @ip_len = "255.255.255.255".size # 15
  @range = 1..100 # starting range
  @max_line_len = 1000 # length to check against
  @count = 0 # iteration counter

  # Given a upper and lower boundary, determine if its
  # middle value is over or under the given line length
  # If over, use the lower boundary (lower..mid) for a recursive check,
  # otherwise use upper boundary (mid..upper)
  def check_boundary(lower, upper)
    # determine middle value
    mid = lower + ((upper-lower)/2)

    # Exit recursion if we've found the value
    throw(:found_value, mid) if (upper-lower) == 1

    # only increment iter count if we're checking the length
    @count += 1

    # Get the line length for the variable number of elements
    len = @k_len + (@ip_len*mid) + mid

    # Perform the test
    if len > @max_line_len
      puts_stats lower, mid, upper, len, :over
      # use the lower boundary
      check_boundary(lower, mid)
    else
      puts_stats lower, mid, upper, len, :under
      # use the upper boundary
      check_boundary(mid, upper)
    end
  end

  # Log method for values in a given test
  def puts_stats lower, mid, upper, len, over_under
    puts '%10d | %10d | %10d | %10d | %10s' % [lower, mid, upper, len, over_under]
  end

  # Specify some information for readability
  puts 'Determining how many ip elements can sit on a line with a max length of %d' % @max_line_len
  puts

  legend = '%10s | %10s | %10s | %10s | %10s' % %w(lower mid/test upper len over/under)
  puts legend
  puts '-'*legend.size

  # Run the recursive boundary checking
  golden_ticket = catch(:found_value) do
    check_boundary(@range.first, @range.last)
  end

  # Output results

  puts
  puts 'Golden Ticket (under) = %s' % golden_ticket.to_s
  possible_iterations = @range.last-@range.first
  efficiency = @count.to_f / possible_iterations.to_f
  puts '%d iterations for %d possible iterations (%f efficiency)' % [@count, possible_iterations, efficiency]
{% endhighlight %}

Running the above script will produce the following output:

{% highlight sh %}
  Determining how many ip elements can sit on a line with a max length of 1000

  lower | mid/test | upper | len | over/under
  --------------------------------------------------------------
  1 | 50 | 100 | 840 | under
  50 | 75 | 100 | 1240 | over
  50 | 62 | 75 | 1032 | over
  50 | 56 | 62 | 936 | under
  56 | 59 | 62 | 984 | under
  59 | 60 | 62 | 1000 | under
  60 | 61 | 62 | 1016 | over

  Golden Ticket (under) = 60
  8 iterations for 99 possible iterations (0.080808 efficiency)
{% endhighlight %}

I'm not really sure if the efficiency part makes sense, but you get a sense that it's a LOT faster, not only because we're calculating the line length per test, but also because we're recursing a fraction of calls that the brute force method performs. It's also fun to inflate/deflate the max line len or the starting range values to see how it affects the number of recursions needed to find the number. For instance, set the max line len to 100000 and see how many extra calls have to be made. Also, what happens if your range isn't big enough? What if the range is off (e.g. 75..100)?

Algorithms are nifty.

