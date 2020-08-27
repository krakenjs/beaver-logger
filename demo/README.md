## beaver-logger demo
Allows you to test your client-side and server-side changes.

#### Dependency
This setup requires spinning up a local server to host the node application. I use `http-server`.  `npm i http-server -g`.

#### Setup
1. Install node packages required for the demo in the `/demo`folder. `npm i --prefix ./demo`.
2. Create the published files you will need to run the express application to test server-side changes. `npm run babel-server-test` 
3. create the client-side files you will need to test client-side changes. `npm run webpack` 
4. Start the express application with `node demo/app.js`.
   - Start the server from the repo root directory, `http-server ./`.  Navigate to `/demo/index.htm`.
