<div style="display: block; text-align:center" align="center"><img alt="BCF Logo" src="http://blacksburgchristianfellowship.org/wp-content/uploads/2017/01/yellow-mobile-logo.png" /></div>

# Bible Study Frontend

[![Build Status](https://travis-ci.org/bfan1256/bible-study-application-frontend.svg?branch=master)](https://travis-ci.org/bfan1256/bible-study-application-frontend)

Author: Brandon Fan

## TODO List

* Finish Server Backend for Search Page
* Design and Implement Dashboard Workflow and Pages

## Resources

Frontend Required Pages: [Link to Doc](https://docs.google.com/document/d/1a2zS7lndvH5peYs3xkRrfCH8tZHCuALKemt4sho5DVA/edit?usp=sharing)
Frontend Invision Designs: [Link to Invision](https://invis.io/EMF7SUFZ8)

## Installing Dependencies

Run `npm install` to install all third-party dependencies.

### Using External JavaScript Code

1. Add script to `./src/assets/external-code/js/`
2. Add `/assets/external-code/js/<name-of-file>.js` to .angular-cli.json in the `scripts` array:

```json
{
  "app": [
    {
      "scripts": ["/assets/external-code/js/<name-of-file>.js"]
    }
  ]
}
```

3. Rerun `ng serve`

#### Use in Typescript

1. Go into associated `.ts` file and add after imports:

```typescript
declare const <corresponding-symbol-to-js-file>: any;
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Generating New Pages/Code Scaffolding

Run `ng generate component component-name` to generate a new component (page). You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build For Production

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
