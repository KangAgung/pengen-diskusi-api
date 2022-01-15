require('dotenv').config();
const fs = require('fs');
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

(async () => {
  // let nginx know we want to start serving from the proxy
  fs.openSync('/tmp/app-initialized', 'w');
  const server = await createServer(container);
  await server.start();
  console.log(`server start at ${server.info.uri}`);
})();
