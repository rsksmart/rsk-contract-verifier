[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/rsksmart/rsk-contract-verifier/badge)](https://scorecard.dev/viewer/?uri=github.com/rsksmart/rsk-contract-verifier)
[![CodeQL](https://github.com/rsksmart/rskj/workflows/CodeQL/badge.svg)](https://github.com/rsksmart/rsk-contract-verifier/actions?query=workflow%3ACodeQL)
<img src="img/rootstock-docs.png" alt="RSK Logo" style="width:100%; height: auto;" />

# Rsk contract verifier

> Smart contract source code verifier.

## Requisites

- node >= 19.9.0

## Install

- Install dependecies

``` shell
    npm install
  ```

## Configuration file

(optional)

``` shell
    cp config-example.json config.json
  ```

## Server start

``` shell
  node dist/contract-verifier-api.js
```

## Cache solc compilers

To improve the speed of verification process you can download all the compiler versions
before run the server:

``` shell
  npm run cache-solc
```

## Configuration
  
  **config.json**
  See defaults on: **lib/defaultConfig**
  *(config.json overrides this values)*

  Use:
  
  ```shell
  node dist/tools/showConfig.js
  ```

  to check current configuration
  
**Configurarion Example:**

``` javascript
{
  address: '127.0.0.1', // binding address
  port: 3008, // binding port
  solcCache: '/tmp', // solc compiler versions cache
  log: {
    level: 'debug', // log level
    file: '/var/log/rsk-contract-verifier/contract-verifier.log' // (optional) log file
  },
  timeout: 10000 // verification timeout
}

  ```

## CLI tools

- **rsk-cv-create-payload**: creates JSON payload for verifier.

- **rsk-cv-verify**: verifies a contract payload.
