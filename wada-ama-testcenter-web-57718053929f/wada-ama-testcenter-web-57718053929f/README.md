# TestCenter Web

This is the repository for the Web Application for the ADAMS TestCenter module

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.2.
```sh
$ npm install --global @angular/cli@11.2.2
```
The version of node used is Node 14.16.0
The version of npm used is NPM 6.14.11

At the beginning of each sprint, the version in package.json should be manually updated to `X.Y.0`, where:
- X is the release we are working on. For example, the actual release is V2 => X = 2
- Y is the sprint number we are working on. For example, we are on sprint 16 => Y = 16

## Clone and install the project

Clone and install the project
```sh
$ git clone https://USERNAME@bitbucket.wada-ama.org/scm/adams-ng/testcenter-web.git
$ cd testcenter-web
$ npm install
```

## Development build served via webpack

Run `npm run start` for a dev server. Navigate to `https://localhost:4200/`. The app will automatically reload if you change any of the source files.

## CI/CD && Production build  

The CI relies on the `build-deploy.sh` file - as well as the Dockerfile.

Aside from the translation, all the build instructions are listed within `build-deploy.sh` script.


### Extract the messages for translation and do the translation

1. Extract the messages for translation. Execute the following from the application root:
   ```sh
   $ npm run i18n:extract
   ```
   This will generate a `messages.xlf` file in the `src/i18n` folder.
   This folder contains all the translation files (e.g.: the french language: `messages.fr.xlf` and chinese language: `messages.zh.xlf`).

2. Do the translation for the required languages in the `messages.XX.xlf` files.
   For each `<target></target>` with `state="new"`, translate the message and change the state to `state="final"`.

### Build the angular application for each language

Once the translation is done, build the angular application for each language from the angular root.
The following command will build the application for French and English and output the bundles in a `dist` folder.
```sh
$ npm run build:i18n
```

### Serve the app with the node server

Once the front-end is build for each language:
```sh
$ cd server
$ npm install --production
$ node server.js /path/to/your/.env
```
You can use the .env.dev file for development.
You can also use the commands:
```sh
$ npm run start
$ npm run start:dev
```
in order to run the server with the supplied .env or .env.dev.

Note: each time `npm install` is run in the server, the `../dist` folder containing the assets is copied to `./public`
and the version of the project is set to the same as `../package.json`.

### Bundle, zip

Once the front-end is build for each language:
```sh
1 $ cd server
2 $ npm install --production
3 $ npm run bundle
4 $ npm run zip
```
This will create a zip with everything needed to deploy the application. The zip
will also be pushed to nexus with the version specified in the package.json file with the snapshot prefix.
The package.json files are also copied to keep track of the version.

## Run in production mode from zip

```sh
$ pull zip from nexus
$ cd testcenter-webserver
$ node server.js /path/to/your/.env
```
If no .env is specified, the .env provided in the directory will be used.

## Run with kubernetes (works on minikube)

```sh
1 $ cd kubernetes/<environment>
2 $ kubectl apply -f testcenter-web-all.yaml
```
This will create all the environment variables needed, connected to the respective ADAMS+CAPI+SSO and configure the Service on NodePort.


## Run with docker

```sh
1 # Obtain a testcenter-web.zip under server/ foder, configure a .env file accordingly 
2 $ docker build --target run -t testcenter-web:local .
3 $ docker run -p4200:4200 --env-file=$(pwd)/server/.env.dev testcenter-web:local
```
