const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development', 
  devtool: 'inline-source-map', // Essential for seeing your original code lines in the debugger
  
  // tell Webpack where to start for each part of the extension
  entry: {
    serviceWorker: './src/background/serviceWorker.js',
    content: './src/content/content.js',
    offscreen: './src/offscreen/offscreen.js'
  },

  // tell Webpack where to put the finished products
  output: {
    filename: '[name].bundle.js', 
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Automatically deletes the old dist folder before building
  },

  // this allows us to use 'import' for the AI library
  experiments: {
    topLevelAwait: true,
    asyncWebAssembly: true
  },

  plugins: [
    // copy files that DON'T need to be bundled (HTML and Manifest)
    new CopyPlugin({
      patterns: [
        { from: './src/manifest.json', to: 'manifest.json' },
        { from: './src/offscreen/offscreen.html', to: 'offscreen.html' },
        { from: './src/ml/lexical_model.json', to: 'ml/lexical_model.json' }
      ],
    }),
  ],

  resolve: {
    extensions: ['.js'],
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false,
      "url": false
    }
  }
};