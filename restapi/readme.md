## RESTful JSON API Server

Done in pure Node.js without 3rd-party libraries and frameworks.

### Requirements
- Node.js (tested with 11, should work with 10 LTS)
- `cert.pem` (certificate) and `key.pem` (private key) inside `certs` directory for HTTPS server (optional)

### How to use
```bash
NODE_ENV=staging node index.js
```

The optional NODE_ENV environment is `staging` by default. There's also `production` which will use different ports, configurable in `config.js`.

### How to generate the certificate files
```bash
openssl req -newkey rsa:4096 -new -nodes -x509 -days 3650 -keyout certs/key.pem -out certs/cert.pem -subj "/CN=localhost"
```