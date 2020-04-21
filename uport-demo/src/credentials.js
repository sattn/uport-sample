const { Credentials } = require('uport-credentials');

const { did, privateKey } = Credentials.createIdentity();

console.log(did);
console.log(privateKey);
