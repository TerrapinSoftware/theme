# Theme

This repo hosts the Terrapin theme for the documentation servers.

The following layouts are available. For each layout, you can define a file `_includes/head-XXX.html`, where `XXX` is the layout name. This file will be included in the `<head>` section of the HTML file.

* `base` - the base layout. The body is empty and will be replaced by the rendered file.
* `default` - the default layout. The rendered file will be wrapped into a `<div class="container">` tag.
* `sidebar` - the sidebar layout. 

The sidebar layout also lets you define the contents of the header and footer in the files `_includes/sidebar-header.html` and `_includes/sidebar-footer.html`.

Page defaults (see also the _config.yml file in the `theme` repo):

| Value | Description
| ----- | -----------
| `verify:` | Verify a page for a proper login (default: `false`)
| `toc:` | Display a Table of Contents (default: `true`)
| `search:` | Set to either `true` or `false` to include or exclude a page from search
| `search_group:` | The search group, [see below](#search)
| `sidebar:` | Sidebar settings, followed by (with two extra spaces):
| &nbsp;&nbsp;`file:` | Name of sidebar file (must exist!, default: `_sidebar.md`)
| &nbsp;&nbsp;`width:`  | Sidebar width, (default: 250 pixels)

On a page level, you can also add scripts:

```yaml
scripts:
  - my_script.js
  - another_script.js
```

## Search

There are two frontmatter options that control how a page is integrated into a site search:

* `search: true|false` controls whether the page is searchable at all.
* `search_group: name` sets the name of the search group.

The latter option is especially powerful if you want the site search to be limited to a group of pages. For example, the online books have separate groups for each book so the search cannot go across books.

The group name reflects the name of the search file, which contains a digest of all searchable pages in that group. The file name is `/assets/search/xxx.json`, where `xxx`is the group name. You need to create this file with the following content:

```yaml
---
layout: null
---
{% include search-template.json %}
```

Then, include the search field into e.g. your sidebar file:

    {% include searchfield.html %}

The project configuration in `_config.yml` should declare the search options valid for all pages (see the _config.yml file in the theme folder for full information).

## Display Options

The URL query option `hide` lets you hide several areas of a page. It takes a comma-separated list of areas to hide. Currently, this list includes `header`, `footer`, `sidebar`, `toc`, and `search` for the search field. Additionally, the value `embed` turns off header, footer, and the top part of the sidebar, where the Home link and the search field are located. If you, for example, want to get rid of the header and footer, use this query parameter:

    ?hide=header,footer

If you want to add your own parts of a page to hide, just add a class named `hide-xxx` to that part of the HTML, where `xxx` is the name of the part. If you, for example, want to hide an area named `instructions`, use e.g. a `span` tag like this:

```markdown
<span class="hide-instructions">My instructions...
```

## Other Assets

In the `/assets/img` folder, we have the `favicon.ico` and the `terrapin_logo.png` files.

In the `/assets/css` folder, we have the `theme-colors.css` and the `terrapin.css` files. The former defines colors, and the latter defines extensions to the markdown. That file can also be added to VSCode as extra markdown styles for a better preview of markdown text.

## Log-In Pages

The assets for a log-in page are defined here as well. Use this template for a log-in page:

```yaml
---
title: Login
layout: default
verify: false
toc: false
scripts:
  - login.min.js

# the messages for the login form
login-form:
  prompt: 'Enter your Login Code:'
  help: 'Five groups of five letters or digits, separated by dashes'
  remember: 'Remember Me'
  button: 'Log In'
  error: 'Invalid Login Code'
---

# ![](/assets/img/terrapin_logo.png) Your Title
----

{% include login-form.html %}
```

# Techno-Babble

## Local Files

Your local `Gemfile` (which is not checked in) looks like this:

    source "https://rubygems.org"
    gem 'github-pages', group: :jekyll_plugins

## Using the Theme Locally

You need to create two different config files for Jekyll. In `_config.yml`, add this line:

    remote-theme: TerrapinSoftware/theme

Create another file `_local.yml` and use this line instead of the line above:

    theme: terrapin-theme

Add this line to your local Gemfile (you may need to update the path):

    gem "terrapin-theme", path: "../theme"

Finally, start Jekyll with:

    bundle exec jekyll serve --config _local.yml
