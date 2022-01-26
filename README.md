# pengen-diskusi-api
Submission for [Menjadi Back-End Developer Expert](https://www.dicoding.com/academies/276) class from Dicoding

## Getting started
install dependency

```sh
npm install
```

edit `config/database/.example.test.json` file then rename it to `config/database/test.json`
```json
{
  "user": "<YOUR_PG_TEST_USER>",
  "password": "<YOUR_PG_TEST_PASSWORD>",
  "host": "localhost",
  "port": 5432,
  "database": "<YOUR_PG_DB_TEST_NAME>"
}
```

edit `.env.example` file then rename it to `.env`
```text
# HTTP SERVER
HOST=localhost
PORT=5000
NODE_ENV=development

# POSTGRES
PGHOST=localhost
PGUSER=<YOUR_PG_USER>
PGDATABASE=<YOUR_PG_DB_NAME>
PGPASSWORD=<YOUR_PG_PASSWORD>
PGPORT=5432

# POSTGRES TEST
PGHOST_TEST=localhost
PGUSER_TEST=<YOUR_PG_TEST_USER>
PGDATABASE_TEST=<YOUR_PG_DB_TEST_NAME>
PGPASSWORD_TEST=<YOUR_PG_TEST_PASSWORD>
PGPORT_TEST=5432

# TOKENIZE
ACCESS_TOKEN_KEY=<YOUR ACCESS_TOKEN>
REFRESH_TOKEN_KEY=<YOUR_TOKEN_KEY>
ACCESS_TOKEN_AGE=3000
```

run migrate for environment test & development
```sh
npm run migrate:dev
npm run migrate:test
```

run test
```sh
npm run test
```

run in development mode
```sh
npm run start:dev
```

to run in production mode, change `NODE_ENV` in `.env` file to `production`
```text
# HTTP SERVER
HOST=localhost
PORT=5000
NODE_ENV=development <-- change this to production
```
run migrate for production mode
```sh
npm run migrate
```
then run command below
```sh
npm run start
```

> Note: production mode only works in heroku. For additional information, please read [Notes](#notes) below

## Notes
Since this repository using [Nginx Buildpack](https://github.com/heroku/heroku-buildpack-nginx) 
from heroku as reverse proxy. Production mode only works in heroku. 
if you want to run production mode outside heroku, you need to do some changes. 
Please take a note this repository also using [Heroku Postgres](https://elements.heroku.com/addons/heroku-postgresql) as database,
and implementing CI/CD using GitHub actions.
see instruction below to set up for non-heroku environment.

1. open file [`src/app.js`](https://github.com/KangAgung/pengen-diskusi-api/blob/master/src/app.js) and remove some lines of code
```js
require('dotenv').config();
const fs = require('fs'); // remove this line
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

(async () => {
  // let nginx know we want to start serving from the proxy
  if (process.env.NODE_ENV === 'production') fs.openSync('/tmp/app-initialized', 'w'); // remove this line
  const server = await createServer(container);
  await server.start();
  console.log(`server start at ${server.info.uri}`);
})();
```

2. open file [`src/Infrastructures/http/createServer.js`](https://github.com/KangAgung/pengen-diskusi-api/blob/master/src/Infrastructures/http/createServer.js) and change this code below
```js
// some missing codes

const server = Hapi.server({
  host: process.env.HOST,
  port: process.env.NODE_ENV === 'production' ? '/tmp/nginx.socket' : process.env.PORT, // change this line
  // port: process.env.PORT <-- change line above to this
});

// some missing codes
```

3. if you don't want to use heroku postgres database, you need to open file [`src/Infrastructures/database/postgres/pool.js`](https://github.com/KangAgung/pengen-diskusi-api/blob/master/src/Infrastructures/database/postgres/pool.js) and change this code below
```js
// some missing codes

// remove this part of code
const herokuConfig = {
  ssl: {
    rejectUnauthorized: false,
  },
};

// and then modify this part of code
const createPool = () => {
  if (process.env.NODE_ENV === 'production') return new Pool({ ...herokuConfig });
  // if (process.env.NODE_ENV === 'production') return new Pool(); <-- change line above to this
  if (process.env.NODE_ENV === 'test') return new Pool({ ...testConfig });
  if (process.env.NODE_ENV === 'development') return new Pool();
  return new Pool({ ...testConfig, ...herokuConfig }); // you should modify this line too
};

const pool = createPool();

// or you can change the code above with this code below
// const pool = process.env.NODE_ENV === 'test' ? new Pool({ ...testConfig }) : new Pool();

module.exports = pool;
```

4. if you want to use GitHub Action for CI, you need to edit file [`.github/workflows/ci.yml`](https://github.com/KangAgung/pengen-diskusi-api/blob/master/.github/workflows/ci.yml)
```yaml
    - name: npm install migrate and test
      run: |
        npm install
        npm run migrate up
        export NODE_ENV=staging && npm run test
        # npm run test <-- change line above to this
```

### License
MIT
