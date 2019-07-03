const path = require("path");

const webview = {
  name: "webview",
  entry: {
    index: "./webview/index.tsx"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    alias: {
      preact: path.join(__dirname, "node_modules", "preact", "src")
    },
    extensions: [".ts", ".js", ".tsx", ".jsx"]
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist")
  }
};

const webview_svelte = {
  entry: {
    bundle: ["./svelte/index.js"]
  },
  resolve: {
    extensions: [".mjs", ".js", ".svelte"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    chunkFilename: "index.[id].js"
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        use: {
          loader: "svelte-loader"
        }
      },
      {
        test: /\.css/,
        use: ["style-loader", "css-loader"]
      }
    ]
  }
};

const extension = {
  name: "extension",
  target: "node",
  entry: "./src/extension.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "extension.js",
    chunkFilename: "[name].bundle.js",
    libraryTarget: "commonjs2"
  },
  externals: {
    vscode: "commonjs vscode"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  }
};

module.exports = [extension, webview_svelte];
