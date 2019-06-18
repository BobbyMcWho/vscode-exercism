# Changelog

## v1

### v1.13.0 (June 18th 2019)

- [chore] Fixed some formatting/legibility issues
- [nodes] You now view and modify folders and their contents
- [webview] No longer sending messages when hidden
- [debt] Removed usage of `fs` in favor of `fs-extra`
- [icons] Added a fallback icon so the errors about icons not being found don't show up

### v1.12.0 (June 17th 2019)

- [chore] Deleted assets branch in favor of .vscodeignore
- [publish] No longer including the webview folder in the packaged extension
- [test] Included a framework for integration tests
- [webview] Fixed header tags: you can now click on a tag to filter the tree. This was previously supported but it broke with the last release.
- [preview] Removed some logging that was causing type errors
- [commands] Made open & start much faster
- [webview] Improved width when views are split

### v1.11.0 (June 16th 2019)

- [chore] Removed some logging that wasn't necessary
- [preview] Completely rewrote how preview panels are managed. This was in preparation for a v2 release where tracks and files will also have their own previews
- [docs] Improved some phrases in the README

### v1.10.3 (June 15th 2019)

- [docs] Made changelog prettier and added dates
- [docs] Updated README.md

### v1.10.2 (June 15th 2019)

- [docs] Added CHANGELOG.md and CONTRIBUTING.md
- [docs] Rewrote and improved README.md
- [icons] Moved CustomIconURI into its own file and added some missing types
