<p align="center">
  <img width="100%" src="https://github.com/masliu/vscode-exercism/blob/assets/banner.jpg?raw=true">
</p>

> Complete Exercism challenges without leaving your favorite editor.

## Getting Started

### Prerequisites

This extension assumes the official [Exercism](https://exercism.io) client has already been installed.

### Installation

You can download this extension from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/). To build from source, run `npm build-dev` or use the launch scripts.

### Usage

Send me screenshots/gifs with your favorite themes and I'll add them here.

<p align="center">
  <img width="100%" src="https://github.com/masliu/vscode-exercism/blob/assets/demo.gif?raw=true">
</p>

### Notes

- I'm not affiliated with Exercism, Inc
- The status of your exercise is not synced online (exercism.io won't know if you've marked an exercise as "complete" inside this extension)
- You can import/export your data from a .json file instead

## FAQ

**Why did you create this extension?**

I wanted a way to quickly do exercises during 30-minute breaks without having to leave my editor or close my current workspace.

**Is this extension available for Atom/Emacs/Vim etc...**

No. Please use the [official client](https://github.com/exercism/cli) or find a suitable alternative.

**Why can't I view my online information?**

There is currently no available api that supports that functionality. Please subscribe to [#4087](https://github.com/exercism/exercism/issues/4087) for more information.

## Contributing

Pull requests, feature requests, or any other form of contribution is always welcome.

I only use Exercism in independent mode which is why I would appreciate some feedback/suggestions on how to improve this extension for everyone else. If there's a feature you feel would greatly enhance your experience, please let me know by filing an issue and I'll try my best to work on it.

## Roadmap

- Add commenting support
- Display profile information
- Display statistics
- Restructure codebase (instead of scraping data maybe we should just provide a local copy?)
- Get rid of import/export
- Not rely on the cli client; implement our own client instead

## License

Source code is licensed under MIT. Track and Exercise icons are licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) by Exercism, Inc and Noun Project. Status icons are licensed under [CC BY-ND 3.0](https://creativecommons.org/licenses/by-nd/3.0/) by Icons8 LLC.
