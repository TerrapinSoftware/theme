# Theme

This repo hosts the Terrapin theme for the documentation servers.

The following layouts are available. For each layout, you can define a file `_includes/head-XXX.html`, where `XXX` is the layout name. This file will be included in the `<head>` section of the HTML file.

* `base` - the base leyout. The body is empty and will be replaced by the rendered file.
* `default` - the default layout. The rendered file will be wrapped into a `<div class="container">` tag.
* `sidebar` - the sidebar layout. 

Page defaults (see also _config.yml):

| Value | Description
| ----- | -----------
| `verify:` | Verify a page for a proper login (default: `false`)
| `toc:` | Display a Table of Contents (default: `true`)
| `sidebar:` | Sidebar settings, followed by (with two extra spaces):
| `file:` | Name of sidebar file (must exist!, default: `_sidebar.md`)
| `width:`  | Sidebar width, (default: 250 pixels)

On a page level, you can also add scripts:

```yaml
scripts:
  - my_script.js
  - another_script.js
```
## Display Options

For each page URL, you can hide the header, footer, the TOC, or the sidebar, by using the "?hide=" query. This query takes a comma-separated list of the parts to hide. If you, for example, want the bare page content without any decoration,
use this query parameter:

    ?hide=header,footer,toc,sidebar

## Assets

In the `/assets/img` folder, we have the `favicon.ico` and the `terrapin_logo.png` files.

In the `/assets/css` folder, we have the `styles.scss` and the `terrapin.css` files. The former defines colors and additional styling, and the latter defines extensions to the markdown. That file can also be added to VSCode as extra markdown styles.

## Log-In Pages

The assets for a log-in page are defined here as well. Use this template for a log-in page:

```markdown
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
-----

{% include login-form.html %}
```
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
