const express = require('express');
const ngrok = require('ngrok');
const path = require('path');

let endpoint = '';
const app = express();

app.get('/', function(req, res) {
 res.sendFile(path.join(__dirname + '/index.html'));   
});
app.get('/verification', function(req, res) {
    res.sendFile(path.join(__dirname + '/verification.html'));
});
app.get('/verified', function(req, res) {
    res.sendFile(path.join(__dirname + '/verified.html'));
});

const server = app.listen(8088, () => {
    ngrok.connect(8088).then(ngrokUrl => {
        endpoint = ngrokUrl;
        console.log(`Your dApp is being served!, open at ${endpoint} and scan the QR to login!`);
    });
});
