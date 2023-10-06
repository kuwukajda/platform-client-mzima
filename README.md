# Platform Client (Mzima)

> This Platform Client (Mzima) workspace is generated using [Nx, a Smart, fast and extensible build system.](https://nx.dev)

This Platform Client (Mzima) repo houses 2 clients: The web client and the mobile client. Find the installation instructions below.

#

### Requirements
- Node.js version: Node.js versions >= 18
- Operating systems: Mac OS, Linux, windows (If you are having issues with windows you can set up WSL - windows Subsystem for Linux)

#

### Cloning Instructions: Contributors
> Fork this repository. Then clone the forked repository. 

If you are using `https` url, the clone command with your url will look like this:

````
git clone https://github.com/your-own-github-account-user-name-will-be-here-instead/platform-client-mzima.git
````

If you are using `SSH` url, the clone command with your url will look like this:

````
git clone git@github.com:your-own-github-account-user-name-will-be-here-instead/platform-client-mzima.git
````

#

### Cloning Instructions: Repo maintainers
> Clone this repository directly.

If you are using `https` url, use:

````
git clone https://github.com/ushahidi/platform-client-mzima.git
````

If you are using `SSH` url, use:

````
git clone git@github.com:ushahidi/platform-client-mzima.git
````

#

### Installing dependencies
You need this step whether you are developing for the web client or the mobile client. After cloning, change directory into the root of this repository, then install dependencies:
````
npm install
````

#

### Web Client: Launch in web browser
In the root of this repository, run the script command in the code block below to get the web client running locally on your computer, and in the web browser:

````
npm run web:serve
````

> Find the code for web client inside of the `apps/web-mzima-client` folder

### Web Client: Setting up the backend platform API
After running the `web:serve` script command above, you should be able to open up the web client's user interface in the browser. 

The web client is currently connected to our staging API. This is set in the web client's `env.json` file with:

````
"backend_url": "https://mzima-dev-api.staging.ush.zone/",
````

You can choose to set up your own backend locally using our [backend platform API](https://github.com/ushahidi/platform), and connect it to the web client instead. To set up the backend for yourself, follow the installation instructions on the [backend API's readme](https://github.com/ushahidi/platform#setup-essentials). Then replace the `"backend_url"` value in the web client's `env.json` file with the url of the backend you have successfully setup.


#

### Mobile Client: Launch in web browser

In the root of this repository, run the script command in the code block below to get the mobile client running locally on your computer, and in the web browser:

````
npm run mobile:serve
````

> Find the code for mobile client inside of the `apps/mobile-mzima-client`

### Mobile Client: Launch in Android emulator

Have (up-to-date version of) android studio installed on your computer so that you can be able to open up the the user interface on an android mobile phone emulator.

If you can run the `mobile:serve` script command above without problems, then you can already launch the mobile client on an android emulator if you have android studio and have set up an android emulator in android studio.

In the root of this repository, run the script command in the code block below to launch/open the mobile client on an android phone emulator:

````
npm run mobile:android
````

### Mobile Client: Launch in iOS simulator

You can only develop for iOS or run an iOS simulator with a Mac OS computer. 

Add more info here...


### Mobile Client: Further help incase of errors

If the `mobile:serve` script command above does not successfully run the app and there are errors in the terminal, you probably don't have capacitor and/or some other dependencies installed in other to run the mobile client. Do the following:

Change directory into `apps/mobile-mzima-client`. Then install dependencies:

````
npm install
````

You could be having npm installation issues if you don't have vips on your computer or if it's not updated. Install or re-install vips:
> Note: this vips installation instruction is for mac. For other Operating Systems, you can help improve this doc by letting us know how you were able to resolve this issue (if you encounter it too).

Get vips info from homebrew:

````
brew info vips
````

Re-install vips:

````
brew reinstall vips
````

Continue from here...

Change directory back to the root of the repository and run the mobile:serve script command again. If client successfully runs, you don't need to take any further step. 

If there are still errors in the console,

# 

### Setting up the backend platform API locally
After launching any of the clients following the instructions in the **Web Client: Development** or the **Mobile Client: Development** sections above depending on the client you are running, you should be able to open up the user interface in the browser (web client) or on a simulator (mobile client). 

The web client and mobile client currently connected to our staging API. This is set in the web or mobile client's `env.json` file with:

````
"backend_url": "https://mzima-dev-api.staging.ush.zone/",
````

You can choose to set up your own backend locally using our [backend platform API](https://github.com/ushahidi/platform), and connect it to the web or mobile client instead. To set up the backend for your self, follow the installation instructions on the [backend API's readme](https://github.com/ushahidi/platform#setup-essentials). Then replace the `"backend_url"` value in the web or mobile client's `env.json` file with the url of the backend you have successfully setup.


<!--
<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ **This workspace has been generated by [Nx, a Smart, fast and extensible build system.](https://nx.dev)** ✨

Run `make start` (requires Docker) to launch and open http://localhost:80

> Requires the [Platform server](https://github.com/ushahidi/platform) backend running in the background. Check the [launch instructions](https://github.com/ushahidi/platform#setup-essentials)

## Requirements

Node.js >16

## Launch Web project

Run `npm run web:serve` to see a web project.

Run `npm run web:build` to make production build for deploy.


## Mobile project

Before invoking the capacitor commands, you must go into the folders of the `mobile project` and run the `npm install`commands to install the plugin inside the mobile project
!!! All native plugins for mobile development must be installed in the mobile project folder `mobile-mzima-client`

Run `npm run mobile:serve` - "nx run mobile-mzima-client:serve",

Run `npm run mobile:build` - "nx run mobile-mzima-client:build",

Run `npm run mobile:add-ios` - "nx run mobile-mzima-client:cap:add-ios",

Run `npm run mobile:add-android` - "nx run mobile-mzima-client:cap:add-android",

Run `npm run mobile:sync` - "nx run mobile-mzima-client:cap:sync",

Run `npm run mobile:ios` - "nx run mobile-mzima-client:cap:ios",

Run `npm run mobile:android` - "nx run mobile-mzima-client:cap:android",

## Understand this workspace

Run `nx graph` to see a diagram of the dependencies of the projects.

## Remote caching

Run `npx nx connect-to-nx-cloud` to enable [remote caching](https://nx.app) and make CI faster.

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.

-->
