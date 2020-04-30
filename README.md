# TZFiles

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.1.

A File sharing application build on Angular and NodeJS. 

In order for the application to work you need to create a folder in the server that will run the BACKEND NodeJS application that is going to act as the remote Disk.

  For this step all that is needed is to define the Folder in the ROOT_DIR variable in the BACKEND/index.js file
  
  ```javascript
  ...
  var https = require('https');

  http.globalAgent.maxSockets = Infinity;
  https.globalAgent.maxSockets = Infinity;

  var ROOT_DIR = "F:\\TZFiles"; // <----------- Folder to define

  // const directoryPath = path.join(ROOT_DIR);
  var app = express();
  // enable files upload
  ...
  ```
  
NPM install is needed for both the BACKEND folder and the main folder containing the Angular FrontEnd application before beeing served

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
