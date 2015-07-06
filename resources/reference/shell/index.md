---
layout: page
title: Shell
---

---

# CONTENTS
1. [Configuring Git](#configuring-git)
2. [Jekyll and Git](#jekyll-and-git)

## Configuring Git

We'll be using Git for our version control system so we're going to set it up to match our Github account. If you don't already have a Github account, make sure to register. It will come in handy for the future.

Replace the example name and email address in the following steps with the ones you used for your Github account.

    git config --global color.ui true
    git config --global user.name "YOUR NAME"
    git config --global user.email "YOUR@EMAIL.com"
    ssh-keygen -t rsa -C "YOUR@EMAIL.com"

The next step is to take the newly generated SSH key and add it to your Github account. You want to copy and paste the output of the following command and paste it here.

    cat ~/.ssh/id_rsa.pub

Once you've done this, you can check and see if it worked:

    ssh -T git@github.com

You should get a message like this:

    Hi excid3! You've successfully authenticated, but GitHub does not provide     shell access. 

## Jekyll and Git
[Git Documentation](https://help.github.com/articles/using-jekyll-with-pages/)
[Your website with Jekyll and Git](http://tuxette.nathalievilla.org/?p=1403&lang=en)
[How To Deploy Jekyll Blogs with Git](https://www.digitalocean.com/community/tutorials/how-to-deploy-jekyll-blogs-with-git)
