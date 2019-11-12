---
layout: single
title: Markdown
---

---

# Additional Resources
- [Markdown Tester](https://daringfireball.net/projects/markdown/dingus)
- [Markdown Syntax](https://daringfireball.net/projects/markdown/syntax)
- [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)
- [MultiMarkdown](https://fletcherpenney.net/multimarkdown/)
- [Markdown Cheatsheet](https://scottboms.com/downloads/documentation/markdown_cheatsheet.pdf)


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

  [1]: https://google.com/        "Google"
  [2]: https://search.yahoo.com/  "Yahoo Search"
  [3]: https://search.msn.com/    "MSN Search"
Using the implicit link name shortcut, you could instead write:

I get 10 times more traffic from [Google][] than from
[Yahoo][] or [MSN][].

  [google]: https://google.com/        "Google"
  [yahoo]:  https://search.yahoo.com/  "Yahoo Search"
  [msn]:    https://search.msn.com/    "MSN Search"

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
![Alt text](https://www.psychologicalscience.org/redesign/wp-content/uploads/2013/03/Spunt_Bob250X300.jpg)
![Alt text](https://www.psychologicalscience.org/redesign/wp-content/uploads/2013/03/Spunt_Bob250X300.jpg "Bob Spunts")

# LINKS
<https://bobspunt.com/>
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
