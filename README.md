# RespVis

A framework to build responsive visualizations based on SVG and with a strong focus on styling and layouting via CSS.

A live version of the `master` branch can be found at [respvis.netlify.app](https://respvis.netlify.app/).

# Commands

## Installing

The framework is built on the Node ecosystem so before attempting to do anything else, we need to install all the dependencies.

```
npm install
```

## Building

Gulp is used to automate repeatable tasks.

The build task will create a new build of the whole framework and the examples into the `dist` folder. To explore a built version, simply open the `dist/index.html` file in a browser.

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
