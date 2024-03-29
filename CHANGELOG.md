# Changelog

## v1

### v1.16.9 (December 9th, 2019)

- Updated packages
- Added new track icons

### v1.16.7 (October 11th, 2019)

- Updated icons

### v1.16.5 (September 13th, 2019)

- Added .dart files to default glob
- Fixed issue where having spaces in file path wouldn't allow you to submit files

### v1.16.4 (August 8th 2019)

- Ignoring node_modules by default
- Added some file extensions to the glob

### v1.16.3 (July 13th 2019)

- Updated dependencies
- Changed some error messages

### v1.16.2 (July 3rd 2019)

- Removed unused packages

### v1.16.1 (July 3rd 2019)

- Fixed filtering issues... again :(

### v1.16.0 (July 3rd 2019)

- Context menu commands will no longer be accessible from the commands palette
- Fixed issue where resetting the filters wouldn't work
- Added several new context menu commands
- Improved preview layout and added some minor features
- Started using svelte instead of preact
- Screenshot updated to reflect recent changes

### v1.15.3 (June 26th 2019)

- Updated screenshot
- Fixed folders not showing up (this broke with previous update)

### v1.15.2 (June 26th 2019)

- Fixed problem with exercise icon & topic filter not updating
- Made preview header smaller
- Lazy loading scraping module
- Hiding sidebar for open & start only when its visible now
- By default README.md is now ignored by open & start

### v1.15.1 (June 24th 2019)

- Fixed version number mismatch

### v1.15.0 (June 24th 2019)

- Rewrote filtering logic again
- New screenshot
- Fixed `open and start` issues
- Added a new setting called `openStartGlob`. You can use this setting to customize which files will open for `open and start`

### v1.13.2 (June 20th 2019)

- Rewrote filtering logic so filter states are going to be reset
- Add new screenshot
- Improved file sorting

### v1.13.1 (June 19th 2019)

- Fixed regression where track complete count would not update
- Made icons display faster
- Fixed async issues with open & start (should feel much faster now)

### v1.13.0 (June 18th 2019)

- Fixed some formatting/legibility issues
- You now view and modify folders and their contents
- No longer sending messages when hidden
- Removed usage of `fs` in favor of `fs-extra`
- Added a fallback icon so the errors about icons not being found don't show up

### v1.12.0 (June 17th 2019)

- Deleted assets branch in favor of .vscodeignore
- No longer including the webview folder in the packaged extension
- Included a framework for integration tests
- Fixed header tags: you can now click on a tag to filter the tree. This was previously supported but it broke with the last release.
- Removed some logging that was causing type errors
- Made open & start much faster
- Improved width when views are split

### v1.11.0 (June 16th 2019)

- Removed some logging that wasn't necessary
- Completely rewrote how preview panels are managed. This was in preparation for a v2 release where tracks and files will also have their own previews
- Improved some phrases in the README

### v1.10.3 (June 15th 2019)

- Made changelog prettier and added dates
- Updated README.md

### v1.10.2 (June 15th 2019)

- Added CHANGELOG.md and CONTRIBUTING.md
- Rewrote and improved README.md
- Moved CustomIconURI into its own file and added some missing types
