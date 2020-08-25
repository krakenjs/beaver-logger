## beaver-logger demo
Allows you to test your client-side and server-side changes.

#### Dependency
This setup requires spinning up a local server to host the node application. I use `http-server`.  `npm i http-server -g`.

#### Setup
1. Install node packages required for the demo in the `/demo`folder.
2. From the root directory of this repo: 
   - `npm run babel-server-test` in your terminal. This will create the published files you will need to run the express application to test server-side changes.
   -  `npm run webpack` in your terminal. This will create the client-side files you will need to test client-side changes.
   - Start the express application from the `/demo`. `node app.js`.
   - Start the server from the repo root directory, `http-server ./`.  Navigate to `/demo/index.htm`.
