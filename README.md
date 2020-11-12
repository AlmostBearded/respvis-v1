# RespVis

The goal of this framework is to make building responsive visualizations as easy as possible while also providing mechanisms for powerful customization and extensibility. This is achieved by merging SVG-based components with a layouting engine based on the CSS grid syntax.

A live version of the `master` branch can be found at [respvis.netlify.app](https://respvis.netlify.app/).

# Commands

## Installing

The framework is built on the Node ecosystem so before attempting to do anything else, we need to install all the dependencies.

```
npm install
```

## Building

Gulp is used to automate repeatable tasks.

The build task will create a new build of the whole framework and the examples into the `dist` folder. To test a built version you have to deploy the `dist` folder to a web server, or open the `dist/index.html` file directly in a browser (make sure your browser CORS policy [allows local file requests](https://dev.to/dengel29/loading-local-files-in-firefox-and-chrome-m9f)).

```
gulp build  // Using globally installed gulp

npx gulp build  // Using packaged gulp
```

## Development

For development it is oftentimes very useful to automatically rebuild and reload an app. This framework uses Browsersync to implement this and the command to run a hot-reloadable live server is

```
gulp serve  // Using globally installed gulp

npx gulp serve  // Using packaged gulp
```

or simply

```
gulp  // Using globally installed gulp

npx gulp  // Using packaged gulp
```
