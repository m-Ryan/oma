const Crypto = require('crypto');
var iv = Crypto.randomBytes(16).toString('utf8');
console.log(iv)