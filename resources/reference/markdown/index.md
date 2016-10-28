---
layout: subpage
title: Markdown
---

---

# Additional Resources
- [Markdown Tester](http://daringfireball.net/projects/markdown/dingus)
- [Markdown Syntax](http://daringfireball.net/projects/markdown/syntax)
- [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)
- [MultiMarkdown](http://fletcherpenney.net/multimarkdown/)
- [Markdown Cheatsheet](http://scottboms.com/downloads/documentation/markdown_cheatsheet.pdf)


# HEADERS

This is an H1
=============
This is an H2
-------------
# This is an H1
## This is an H2

# HORIZONTAL RULES

* * *

***

*****

- - -

---------------------------------------

# INLINE HTML



# REFERENCES
I get 10 times more traffic from [Google] [1] than from
[Yahoo] [2] or [MSN] [3].

  [1]: http://google.com/        "Google"
  [2]: http://search.yahoo.com/  "Yahoo Search"
  [3]: http://search.msn.com/    "MSN Search"
Using the implicit link name shortcut, you could instead write:

I get 10 times more traffic from [Google][] than from
[Yahoo][] or [MSN][].

  [google]: http://google.com/        "Google"
  [yahoo]:  http://search.yahoo.com/  "Yahoo Search"
  [msn]:    http://search.msn.com/    "MSN Search"

# LISTS
-   Red
-   Green
-   Blue

1.  Bird
2.  McHale
3.  Parish

-   Red
    1. Yes
    2. No
-   Green
    1. OK
    2. YUP!
-   Blue

# EMPHASIS
*single asterisks*
_single underscores_
**double asterisks**
__double underscores__
\*this text is surrounded by literal asterisks\*
--Strikethrough--
Super<sup>script</sup>
Sub<sub>script</sub>


# CODE
This is a normal paragraph:

    This is a code block.

`Inline code`
Use the `printf()` function.
``There is a literal backtick (`) here.``
A single backtick in a code span: `` ` ``
A backtick-delimited string in a code span: `` `foo` ``


# IMAGES
![Alt text](http://www.psychologicalscience.org/redesign/wp-content/uploads/2013/03/Spunt_Bob250X300.jpg)
![Alt text](http://www.psychologicalscience.org/redesign/wp-content/uploads/2013/03/Spunt_Bob250X300.jpg "Bob Spunts")

# LINKS
<http://bobspunt.com/>
<bobspunt@gmail.com>

# BACKSLASH ESCAPES
Markdown provides backslash escapes for the following characters:

| char     | descrip             |
| :------: | :-----------        |
| \        | backslash           |
| `        | backtick            |
| *        | asterisk            |
| __       | underscore          |
| { }      | curly braces        |
| [ ]      | square brackets     |
| ( )      | parentheses         |
| #        | hash mask           |
| +        | plus sign           |
| -        | minus sign (hyphen) |
| .        | dot                 |
| !        | exclamation mark    |
