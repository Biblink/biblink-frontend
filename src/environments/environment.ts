// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  es_url: 'https://api.ogs.bhsswimanddive.com', // change this if you are doing a demo
  firebase: {
    apiKey: 'AIzaSyAruFcRRzxkzNydXszNkZiHJE6fbqOHpf0',
    authDomain: 'biblya-ed2ec.firebaseapp.com',
    databaseURL: 'https://biblya-ed2ec.firebaseio.com',
    projectId: 'biblya-ed2ec',
    storageBucket: 'biblya-ed2ec.appspot.com',
    messagingSenderId: '4312138799'
  }
};
