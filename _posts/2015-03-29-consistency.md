---
layout: post
title: Consistency
published: true
encoding: utf-8
tags:
- style guides
- consistency
---

In July of 2010 I was hired at a tiny startup known as MoneyDesktop (now [MX](http://mx.com)). We had a legacy PHP+Flex app inherited from a previous company, and as you can imagine, it was not pretty. One of the great things about working at a brand new startup is that you actually don't have any customers yet, so the tech is about as green field as it gets. This is also one of the worst things, because at this stage you don't know what you don't know. We decided from day one to build a service-oriented architecture with Protocol Buffers running the intra-service communication. We ditched the PHP and ported the Flex to run on top of a Rails API service. So sue me.

Naturally, at first we got a lot more things wrong than we got right, but the seed of the architecture that we started was solid and it enabled us to move very quickly to produce a product that customers wanted. We created a system that in just over 12 months was starting to get out of hand. We used Rails for all of the "front-end" services but decided to use Sinatra to power others because they were "lighter weight". At one point I started writing a custom event service, only later to find RabbitMQ (thank the heavens we found it before I'd gotten very far). We had a lot of duplication and not a lot of established patterns for how to be consistent. We were really good at clever solutions, but didn't understand how damaging that was to the long term health of our software.

### Finding Coal

In late 2011 we acquired a tiny startup and brought on their technical co-founder as our VP of Engineering, Brandon Dewitt. Brandon's an incredibly smart engineer, and I feel truly blessed to have been able to code under his guidance and leadership.

For an entire month after the acquisition there was near-total radio silence from him from a leadership perspective. I started getting super antsy wondering what was going on, worried he was freaking out about our app or our team or the color of the paint on the walls. We had recently gone through some engineering management swing-and-miss situations, so we were really hoping things were going to work out with Brandon.

After about a month he finally opened up that he had some major concerns about the lack of consistency in our software practices, specifically how much technical debt we'd already accumulated in such a short period of time. Sure, we'd done a good job producing a working product, and we were clearly gaining traction in our industry, but at what cost? I remember well Brandon's critique of one of our critical internal services, which had basically had one engineer working on it from day one. We'll call that dev Hank. Hank was no longer with our company, for related reasons:

> "It's like, Hank has a house right next to a power plant. Hank wants to get power to his house so he can run the lights and the dishwasher and all that.
>
> "But instead of plugging into the power station next door, he walks out into his front yard with a shovel, and he starts digging for coal. And he digs, and he digs, and he digs some more. He spends an incredible amount of time digging.
>
> "And you know what's the craziest part? __He fucking found coal!!!__"

A lot of our services were like that, we dug for coal when we had a power plant next door.

Over the next couple years we evolved the platform into a set of services that were cohesive and well-formed. Working at any layer of the stack was simple because every app was built with the same set of principles and style. We standardized using Rails for every service. We worked hard to solidify the patterns and tooling that enabled us to iterate quickly and produce good code. It's easy for me to say that in 12 years coding, MoneyDesktop had by far the best codebase I've ever worked in. Of course the system wasn't perfect by any stretch of the imagination, but it had "good bones", and [many of the engineers](https://vimeo.com/43774443) MoneyDesktop has employed over the years have [vouched for its elegance](https://www.youtube.com/watch?v=efwZwalqTP0).

Would we have gotten there without Brandon's guidance? Maybe. I've worked for a lot of other companies where consistentcy wasn't even a conversation, and it's my belief that the focus on discoverability and consistency is what made that codebase work well.

### Finding Consistency

A focus on discoverability and consistency should be an intentional and public decision that you make in your software organization. Your developers should know about it, and should hold each other to the standards you agree to.

What does discoverability and consistency mean? It means producing software (hopefully) free from the artifacts of bias, as agreed upon by your team. Do you have to use Rails or protobuf to be discoverable and consistent? Of course not. But you should seek to gain consensus. Here is a simple guide to becoming more consistent and discoverable in your codebase.

### 1. Get a Style Guide

I don't blame you if you just rolled your eyes, I know I did when we got our first style guides at MoneyDesktop. But hear me out.

Style guides abound on github and other places for the language and framework you are using. Find the most idiomatic style guide you can, tweak it at a minimum, and preach it to your team. Get consensus. Get buy-in. Get a style guide.

The style guide really is one of the best things you can have. You will hire plenty of developers who have different opinions about bracing, spacing, how to name methods, size of methods, size of classes, feature X over feature Y... etc. Which one is "right", or does "right" even exist?

__The "right" style guide is the one whereby following it, your team can consistently produce relatively bug-free software in a timely manner.__

A trivial example is bracing. Many languages allow you to omit braces for single line `if`/`else` blocks, but if you want to execute multiple statements per block, you've got to use braces ([Hearbleed](https://en.wikipedia.org/wiki/Heartbleed) anyone?).

{% highlight csharp %}
if (foo.IsValid())
  DoStuff();
else
  DoOtherStuff();
  DoMoreOtherStuff(); // spacing makes me think this should be part of the else
{% endhighlight %}

In this example spacing doesn't save you (unless you're in python), so you've got to use braces on the `else` if you want to execute both method calls. But now what do you do with the `if` statement?

{% highlight csharp %}
if (foo.isValid())
  doStuff();
else
{
  doOtherStuff();
  doMoreOtherStuff();
}
{% endhighlight %}

You _could_ leave braces off the `if` statement, but to be most consistent with the rest of your codebase, why not always use braces? Of course the language allows omitting braces _in certain situations_, but _not in all situations_.

Another example comes from ruby, and it's one I wish the community would figure out. Ruby 1.9 introduced a new hash key syntax when your keys are symbols:

{% highlight ruby %}
# 1.8 symbol keys are same as symbols everywhere else
i_am_a_symbol = :hello
toys = { :woody => :cowboy, :buzz => :space_ranger }

# ... but in 1.9 you can use a different syntax for _the same thing_
toys = { woody: :cowboy, buzz: :space_ranger }
{% endhighlight %}

In both cases, the hash keys are symbols, but in 1.9 you may encounter either one. When I go to change a file with these keys, which do I use? Probably the same as what's in the file, assuming their isn't mixed usage. If there is mixed usage, or I'm creating an entirely new file... what then?

Pick style guide rules that help your team to be consistent now and in the future, regardless of the whims or fancies of Joe, Jane, or Janet Developer (or even fancy new fangled language constructs). I am _not_ saying don't use new language features. I'm saying question the consistency value of new features. I am also _not_ saying how you should use braces or symbol syntax, these are just examples of discussions I have been a part of.

I have had individual developers complain to me about the usage of a style guide and I'll be honest, it boggles my mind. If you find negative value in adhering to a style guide, what you're saying is that your preferences are more important than the health of the codebase over time. Yes, I believe adherence to a style guide produces a healthy codebase.

Your style guide shouldn't contain every possible rule anyone can conceive, merely the preferences which are generally controversial or tend to be confusing to your team. Preferences that drive Sally to produce code that _feels_ different than Jeff's. Everyone has their own style, and that style should never be discouraged as "wrong". Just try to find a commong ground that's consistent and discoverable.

### 2. Use Trusted/Tested Community Libraries

Beginning developers want to write a solution for every problem that they can imagine. Experienced developers want to use everyone else's battle-tested solutions wherever possible. Neither are wrong, but context is pretty important. If the problem you're solving for has a well-tested and well-trusted solution produced by your language community, you really should be using it in your production system. If it doesn't, produce it and then give it back to the community!

That being said, there's a certain amount of taking for granted attitude that we would do well to squash out of our industry. Don't go re-invent the wheel, but you should definitely _study wheels_. Read often. Learn a new software language every year. Subscribe to weekly mailing lists. Hop on that library's IRC and ask questions. Stay familiar with the trends of the language and framework you are using. Go to user group meetings.

No software project is an island, so you should stand on the shoulders of those who've come before. Just don't be ignorant about why they made the decisions they did.

### 3. Write Tests (and run them!)

Please, for the love of all that is holy, write tests for your software. Write tests when you add code. Write tests when you're fixing bugs. Remove practices, processes, and roadblocks that stop your developers from testing.

Once you have those tests, run them during your development and release processes.

### 4. Get Feedback Often

Talk to your team weekly about how things are going (not necessarily the "what", but the "why" and "how"). Talk about your style guides, the libraries you're using (or should be using). Talk about your methods and processes. Hold weekly brown bag discussions. Teach others on your team about past experiences you've had. Start a book club and meet regularly.

Getting feedback will empower your developers to feel like there's a reason they accepted the job offer. Give them a reason to stay, a reason to get or remain passionate about what it is you're doing.

-----------

Finding consistency for your team is a valuable process you can go through. You'll empower your developers to write better code and enjoy what they do. Your project's health will thank you for it.
