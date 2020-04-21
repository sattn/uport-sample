const express = require('express')
const bodyParser = require('body-parser')
const ngrok = require('ngrok')
const decodeJWT = require('did-jwt').decodeJWT
const { Credentials } = require('uport-credentials')
const transports = require('uport-transports').transport
const message = require('uport-transports').message.util

let endpoint = ''
const app = express();
app.use(bodyParser.json({ type: '*/*' }))

const credentials = new Credentials({
    appName: 'Login Example',
    did: 'did:ethr:0xc0403bbe4ebb5ff69b96a66c882cd1c8ca293314',
    privateKey: '6de9244daa4c3aa05064519493275a1dd5569439c65b09324430401db5f155d7'
})

app.get('/', (req, res) => {
    credentials.createDisclosureRequest({
        requested: ["name"],
        notifications: true,
        callbackUrl: endpoint + '/callback'
    }).then(requestToken => {
        console.log(decodeJWT(requestToken))  //log request token to console
        const uri = message.paramsToQueryString(message.messageToURI(requestToken), {callback_type: 'post'})
        const qr =  transports.ui.getImageDataURI(uri)
        res.send(`<div><img src="${qr}"/></div>`)
    })
})

app.post('/callback', (req, res) => {
    const jwt = req.body.access_token
    console.log(jwt);
    credentials.authenticateDisclosureResponse(jwt).then(credentials => {
        console.log(credentials);
        // Validate the information and apply authorization logic
    }).catch( err => {
        console.log(err)
    })
})
  
// run the app server and tunneling service
const server = app.listen(8088, () => {
    ngrok.connect(8088).then(ngrokUrl => {
        endpoint = ngrokUrl
        console.log(`Login Service running, open at ${endpoint}`)
    })
})
