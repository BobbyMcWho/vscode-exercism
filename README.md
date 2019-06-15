# Exercism for Visual Studio Code

<p align="center">
  <img width="100%" src="https://github.com/masliu/vscode-exercism/blob/assets/screenshot.png?raw=true">
</p>

## Getting Started

### Prerequisites

This extension requires you to install the official [Exercism](https://exercism.io) client.

### Installation

You can download this extension from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/). To build from source, simply run `npm build-dev` or use the launch script.

### Notes

- I am not affiliated with Exercism, Inc
- Your progress is not synced with exercism.io (you will need to manually update the status of your exercise)
- You can import/export your data if you need access to it on multiple hosts

## FAQ

**Why did you create this extension?**

I wanted a way to quickly complete exercises during my breaks without having to leave my editor or close my current workspace.

**Does this extension completely replace the website?**

No, my intent is only to create a tool to supplement the website. Furthermore, there is no available api that provides access to user profile information making it extremely difficult to replicate online features.

**Why can't I view my profile information? Why is my progress not synced with exercism.io?**

As mentioned in the answer above, there is no available api that supports that functionality. Please read and subscribe to [#4087](https://github.com/exercism/exercism/issues/4087) for more information.

## Contributing

Pull requests, feature requests, or any other form of contribution is always welcome.

My primary usage of Exercism is in independent mode, which is why I would greatly appreciate some feedback/suggestions on how to improve this extension for everyone else. If there is a feature that you feel would greatly enhance your experience, please let me know by filing an issue and I will do my best to implement it.

## Roadmap

Although the lack of a public api places us in a precarious position, there are still some features that I would like to explore in the near future. The following are some that are planned:

- Commenting support via the comment api
- Profile information
- Statistics
- Track preview with mentor information and language resources
- Tools for mentors (solution queues, review sessions)
- Diffing your solution with a third party solution
- Getting rid of the cli client and implementing our own client instead

## License

Source code is licensed under MIT. The track and exercise icons are licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) by Exercism, Inc and Noun Project. The status icons are licensed under [CC BY-ND 3.0](https://creativecommons.org/licenses/by-nd/3.0/) by Icons8 LLC.
