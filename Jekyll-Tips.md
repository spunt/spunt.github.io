# Jekyll Tips

## Front Matter

The front matter is where Jekyll starts to get really cool. Any file that contains a YAML front matter block will be processed by Jekyll as a special file. The front matter must be the first thing in the file and must take the form of valid YAML set between triple-dashed lines. Here is a basic example:

    ---
    layout: post
    title: Blogging Like a Hacker
    ---

Between these triple-dashed lines, you can set predefined variables (see below for a reference) or even create custom ones of your own. These variables will then be available to you to access using Liquid tags both further down in the file and also in any layouts or includes that the page or post in question relies on.

*Front Matter Variables Are Optional*. If you want to use Liquid tags and variables but don’t need anything in your front matter, just leave it empty! The set of triple-dashed lines with nothing in between will still get Jekyll to process your file. (This is useful for things like CSS and RSS feeds!).

## Predefined Global Variables

There are a number of predefined global variables that you can set in the front matter of a page or post.

| Variable       | Description                                                                          |
| :------------- | :----------------------------------------------------------------------------------- |
| `layout`       | Species name (w/o ext) of layout file (in `_layouts/`) to use                        |
| `permalink`    | Species URL to use if other than site-wide default (`/year/month/day/title.html`)    |
| `published`    | (`true`/`false`) Determines whether post is included in site build                   |

## Custom Variables

For instance, if you set a title, you can use that in your layout to set the page title:

    <!DOCTYPE HTML>
    <html>
      <head>
        <title>{{ page.title }}</title>
      </head>
      <body>
        ...`

## Site Variables

| Variable                       | Description                                                                                                                                                                                                                                                                                                                                                                      |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site.time`                    | The current time (when you run the `jekyll` command).                                                                                                                                                                                                                                                                                                                            |
| `site.pages`                   | A list of all Pages.                                                                                                                                                                                                                                                                                                                                                             |
| `site.posts`                   | A reverse chronological list of all Posts.                                                                                                                                                                                                                                                                                                                                       |
| `site.related_posts`           | If page is a post, this contains list of up to ten related Posts. For high quality but slow to compute results, run the `jekyll` command with the `\--lsi` ([latent semantic indexing][5]) option. Also note GitHub Pages does not support the `lsi` option when generating sites.                                                                                               |
| `site.static_files`            | A list of all [static files][6] (i.e. files not processed by Jekyll's converters or the Liquid renderer). Each file has three properties: `path`, `modified_time` and `extname`.                                                                                                                                                                                                 |
| `site.html_pages`              | A subset of `site.pages` listing those which end in `.html`.                                                                                                                                                                                                                                                                                                                     |
| `site.html_files`              | A subset of `site.static_files` listing those which end in `.html`.                                                                                                                                                                                                                                                                                                              |
| `site.collections`             | A list of all the collections.                                                                                                                                                                                                                                                                                                                                                   |
| `site.data`                    | A list containing the data loaded from the YAML files located in the `_data` directory.                                                                                                                                                                                                                                                                                          |
| `site.documents`               | A list of all the documents in every collection.                                                                                                                                                                                                                                                                                                                                 |
| `site.categories.CATEGORY`     | The list of all Posts in category `CATEGORY`.                                                                                                                                                                                                                                                                                                                                    |
| `site.tags.TAG`                | The list of all Posts with tag `TAG`.                                                                                                                                                                                                                                                                                                                                            |
| `site.[CONFIGURATION_DATA]`    | All the variables set via the command line and your `_config.yml` are available through the `site` variable. For example, if you have `url: http://mysite.com` in your configuration file, then in your Posts and Pages it will be stored in `site.url`. Jekyll does not parse changes to `_config.yml` in `watch` mode, you must restart Jekyll to see changes to variables.    |

## Page Variables

| Variable             | Description                                                                                                                                                                                                                                                                                                           |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page.content`       | The content of the Page, rendered or un-rendered depending upon what Liquid is being processed and what `page` is.                                                                                                                                                                                                    |
| `page.title`         | The title of the Page.                                                                                                                                                                                                                                                                                                |
| `page.excerpt`       | The un-rendered excerpt of the Page.                                                                                                                                                                                                                                                                                  |
| `page.url`           | The URL of the Post without the domain, but with a leading slash, e.g. `/2008/12/14/my-post.html`                                                                                                                                                                                                                     |
| `page.date`          | The Date assigned to the Post. This can be overridden in a Post's front matter by specifying a new date/time in the format `YYYY-MM-DD HH:MM:SS` (assuming UTC), or `YYYY-MM-DD HH:MM:SS +/-TTTT` (to specify a time zone using an offset from UTC. e.g. `2008-12-14 10:30:00 +0900`).                                |
| `page.id`            | An identifier unique to the Post (useful in RSS feeds). e.g. `/2008/12/14/my-post`                                                                                                                                                                                                                                    |
| `page.categories`    | The list of categories to which this post belongs. Categories are derived from the directory structure above the `_posts` directory. For example, a post at `/work/code/_posts/2008-12-24-closures.md` would have this field set to [`'work', 'code']`. These can also be specified in the `YAML Front Matter`.    |
| `page.tags`          | The list of tags to which this post belongs. These can be specified in the `YAML Front Matter`.                                                                                                                                                                                                                    |
| `page.path`          | The path to the raw post or page. Example usage: Linking back to the page or post's source on GitHub. This can be overridden in the `YAML Front Matter`.                                                                                                                                                           |
| `page.next`          | The next post relative to the position of the current post in `site.posts`. Returns `nil` for the last entry.                                                                                                                                                                                                         |
| `page.previous`      | The previous post relative to the position of the current post in `site.posts`. Returns `nil` for the first entry.                                                                                                                                                                                                    |

## Paginator Variables

*NOTE*. These are only available in index files, however they can be located in a subdirectory, such as `/blog/index.html`.

| Variable                          | Description                         |
| :-------------------------------- | :---------------------------------- |
| `paginator.per_page`              | Number of Posts per page.           |
| `paginator.posts`                 | Posts available for that page.      |
| `paginator.total_posts`           | Total number of Posts.              |
| `paginator.total_pages`           | Total number of pages.              |
| `paginator.page`                  | The number of the current page.     |
| `paginator.previous_page`         | The number of the previous page.    |
| `paginator.previous_page_path`    | The path to the previous page.      |
| `paginator.next_page`             | The number of the next page.        |
| `paginator.next_page_path`        | The path to the next page.          |

## Defaults

Instead of repeating this configuration each time you create a new post or page, Jekyll provides a way to set these defaults in the site configuration. To do this, you can specify site-wide defaults using the defaults key in the _config.yml file in your project’s root directory.

The defaults key holds an array of scope/values pairs that define what defaults should be set for a particular file path, and optionally, a file type in that path.

Let’s say that you want to add a default layout to all pages and posts in your site. You would add this to your `_config.yml` file:

    defaults:
      -
        scope:
          path: "" # an empty string here means all files in the project
          type: "posts" # `pages`, `posts`, or `drafts`. This allows restricting default values below to a specific type
        values:
          layout: "default"
      -
        scope:
          path: "" # an empty string here means all files in the project
          type: "pages" # `pages`, `posts`, or `drafts`. This allows restricting default values below to a specific type
        values:
          layout: "project"
          author: "The Dude"

## Default Jekyll Configuration

    # Where things are
    source:       .
    destination:  ./_site
    plugins_dir:  _plugins
    layouts_dir:  _layouts
    data_dir:     _data
    includes_dir: _includes
    collections:
      posts:
        output:   true

    # Handling Reading
    safe:         false
    include:      [".htaccess"]
    exclude:      ["node_modules", "vendor"]
    keep_files:   [".git", ".svn"]
    encoding:     "utf-8"
    markdown_ext: "markdown,mkdown,mkdn,mkd,md"

    # Filtering Content
    show_drafts: null
    limit_posts: 0
    future:      false
    unpublished: false

    # Plugins
    whitelist: []
    gems:      []

    # Conversion
    markdown:    kramdown
    highlighter: rouge
    lsi:         false
    excerpt_separator: "\n\n"
    incremental: false

    # Serving
    detach:  false
    port:    4000
    host:    127.0.0.1
    baseurl: "" # does not include hostname
    show_dir_listing: false

    # Outputting
    permalink:     date
    paginate_path: /page:num
    timezone:      null

    quiet:    false
    verbose:  false
    defaults: []

    liquid:
      error_mode: warn

    # Markdown Processors
    rdiscount:
      extensions: []

    redcarpet:
      extensions: []

    kramdown:
      auto_ids:       true
      footnote_nr:    1
      entity_output:  as_char
      toc_levels:     1..6
      smart_quotes:   lsquo,rsquo,ldquo,rdquo
      input:          GFM
      hard_wrap:      false
      footnote_nr:    1

---

| File or Directory                           | Description                                                                                                                                                                      |
| :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_config.yml`                               | Site configuration. Many of these options can be specified from the command line executable but it's easier to specify them here so you don't have to remember them.             |
| `_drafts`                                   | Drafts are unpublished posts. The format of these files is without a date: `title.MARKUP`.                                                                                       |
| `_includes`                                 | Partials that can be exploited by layouts and posts to facilitate reuse. The liquid tag `{% include file.ext %}` can be used to include the partial in `_includes/file.ext`.     |
| `_layouts`                                  | Templates that wrap posts. Layouts are chosen on a post-by-post basis in the `YAML Front Matter`. The liquid tag `{{ content }}` is used to inject content into the web page.    |
| `_posts`                                    | Your dynamic content. Name must follow the format: `YEAR-MONTH-DAY-title.MARKUP`. (`Permalinks` can be customized for each post)                                                 |
| `_data`                                     | Website data. Jekyll autoloads all YAML files here (`.yml`, `.yaml`, `.json` or `.csv`) and are accessible at `site.data`.                                                       |
| `_site`                                     | Folder for Jekyll-generated site (add to `.gitignore` file.)                                                                                                                     |
| `.jekyll-metadata`                          | Auto-generated file (add to `.gitignore` file.)                                                                                                                                  |
| All `.html`, `.md`, and `.textile` files    | If file has `YAML Front Matter`, it will be converted.                                                                                                                           |
| Other Files/Folders                         | Every other directory/file, e.g. `css` and `images` folders, `favicon.ico` files, will be copied verbatim to the generated site.                                                 |