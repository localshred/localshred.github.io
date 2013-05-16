---
layout: post
title: My Git Workflow
published: true
tags:
- git
- version-control-systems
---
Recently at work we've taken a giant leap forward in our software stack: We ditched CVS and are riding the [git](http://gitscm.org) bandwagon.

And oh what a pretty red wagon it is. Drawn by the big Clydesdales with fancy harnesses. In this article I aim to show the workflow I've been using that I feel will help other people just getting in to git.

### What's this "git" you speak of?

Just a small caveat: if you already know what git is, or if you don't care about how I got into git, skip ahead. Sometimes I'm boring and I can't help it.

Git's been coming along nicely for the last few years gaining all sorts of popularity in the face of Subversion's apparent lead, and CVS's mind-boggling IE6-like stranglehold on the Version Control Systems universe. A lot of the current fervor attributed to git is attributed to several popular open source projects changing their SCM from Subversion to Git, most notably (for me at least) [Ruby on Rails](http://rubyonrails.org "Ruby on Rails") and their switch to [Github](http://www.github.com/rails/rails "Rails on Github").

I'll admit that I had no idea who or what git was until mid-2008 when a co-worker of mine told me he wanted to get into it (no pun intended). I was in my nice cozy comfortable Subversion shell at the time and thought how could one possible want anything more than SVN? Ironically, after using git for the past year or so, I'm thinking the same thing from the git perspective. _How in the world_ are people still using SVN (assuming they have the choice)? Ya, I don't know either.

Due to much of git's current popularity coming from the Rails switch, a lot of the git info you read online comes from people doing stuff in [Ruby](http://ruby-lang.org "Ruby the programming language"). This was certainly my main usage of git after I finally took the plunge late last year, using it to manage the version control of all my Rails/Sinatra projects. Of course, with any VCS, the content you are versioning need not be a specific software project at all. You could use it to version your photoshop design files if you wanted to.

### How sweet it is to be loved by git

Anyways, at work we use Java. And up until about a month ago, we were using CVS to manage our software versioning. We've been doing a great round of tech discussions to improve our stack, and the CVS to Git migration was one of the first targets we moved against, due to the relatively simple nature of the change. I've got to credit [Ben](http://benmatz.wordpress.com "Ben") for randomly deciding to demo git to everybody in one meeting. I just let him run with it, though I probably know git a lot better. By the end of the meeting we were all like, "Okay, so when do we start using it?". I was floored. I thought for sure there'd be reservations and assumed that if we ever did get off of CVS it'd be to Subversion. Well, just a few short weeks later we had imported our entire repo into Git (approximately 900 mb). A few weeks after that, we were completely dependent on git for our VCS of choice. And boy does it feel sweet.

Not a day goes by when _someone_ in dev just randomly exclaims, "How freaking sweet is Git?!", or, "Git is just so fast!". I love hearing this stuff, cause it reinforces my belief that git really is a superior VCS. It brings some passion back into what we do each day. A software developer's tools should always enhance their ability to put out great software. Git does just that.

Okay, so that was the boring back story, here's some of the meat of git that we've been working with. Most of these concepts were taken in one form or another from the [Git Workflow manpage](http://www.kernel.org/pub/software/scm/git-core/docs/gitworkflows.html "Git workflow suggestions").

### Topic Branches

The best thing I pulled from the git workflow article is the concept of the **topic branch**. In git, branching doesn't create new filesystem directories, it just magically handles it all in the cloned repository. This was a huge upgrade from CVS and even Subversion in my opinion. It's one of the biggest reasons I love git so much. Branching is cheap, therefore much more useful.

Topic branches aren't a special kind of branch, it's just a way of thinking about how to use branches for effective project development. Git creates a default branch for your trunk or mainline of development and calls it "master". Each time the project manager assigns me a project (in this case say the project is called "widget"), I follow this workflow:

{% highlight sh %}
# This is a simple descriptor on how I do topic development using git
# Some of the commands are java flavored (like ant),
# but that doesn't mean you can't use this with other languages.

# Step 1 - Synchronize master.
# 1.1 - Checkout master branch
# 1.2 - Get changes from origin
git checkout master
git pull

# Step 2 - Create a new branch to do all widget development.
git co -b widget

# Step 3 (recursive) - Write tests, write code, and commit.
# For every user story in the project, follow this flow:
# 1.1 - Write tests
# 1.2 - Write code to pass the tests
# 1.3 - When the story is completed and the tests pass, commit the code.
# Lather, rinse, repeat until code complete on the project
git add .
git commit -m "Some message about your commit"

# Step 4 - Synchronize master
# 4.1 - Fix any conflicts and commit
git checkout master
git pull
# Do 4.1 if you need to

# Step 5 - Merge the topic branch into master
# 5.1 - Fix any conflicts and commit
git merge widget
# Do 5.1 if you need to

# Step 6 - Fix conflicts, run compiles, run tests
# If tests or compilation fail, go back to step 3
ant compile
ant test # or whatever testing procedure you use

# Step 7 - Push code to origin
# Only perform this step once you have resolved
# all conflicts and all automated tests pass
git push origin master

# Step 8 - Remove your topic branch when topic development has ceased
git branch -d widget
{% endhighlight %}

**How do you manage your projects with git?**

