## RESTful JSON API Server

Done in pure Node.js without 3rd-party libraries and frameworks.

### Requirements
- Node.js (tested with 11, should work with 10 LTS)
- `cert.pem` (certificate) and `key.pem` (private key) inside `certs` directory for HTTPS server (optional)

### How to use
```
NODE_ENV=staging node index.js
```

The optional NODE_ENV environment is `staging` by default. There's also `production` which will use different ports, configurable in `config.js`.