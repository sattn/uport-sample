const express = require('express')
const bodyParser = require('body-parser')
const ngrok = require('ngrok')
const decodeJWT = require('did-jwt').decodeJWT
const { Credentials } = require('uport-credentials')
const transports = require('uport-transports').transport
const message = require('uport-transports').message.util

let endpoint = ''
const app = express()
app.use(bodyParser.json({ type: '*/*' }))

const credentials = new Credentials({
    appName: 'Request Verification Example',
    did: 'did:ethr:0xc65453af387f1b6eae6c27dbb0eb526fa6ff399f',
    privateKey: '55965c03ef10cbef31a5e145297e260e38945a3bd3272a7d7970decb2e349209'
})

app.get('/', (req, res) => {
  credentials.createDisclosureRequest({
    verified: ['CertOfEducation'],
    callbackUrl: endpoint + '/callback'
  }).then(requestToken => {
    console.log(decodeJWT(requestToken))  //log request token to console
    const uri = message.paramsToQueryString(message.messageToURI(requestToken), {callback_type: 'post'})
    const qr =  transports.ui.getImageDataURI(uri)
    res.send(`
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Company Page</h1>
            <p>学歴証明を開示するページです。</p>
            <p>以下のQRコードを読み取ってください</p>
            <div><img src="${qr}"/></div>
          </div>
        </div>
      </main>
    `)
  })
})

app.post('/callback', (req, res) => {
  const jwt = req.body.access_token
  console.log(jwt)
  console.log(decodeJWT(jwt))
  credentials.authenticateDisclosureResponse(jwt).then(creds => {
    //validate specific data per use case
    console.log(creds)
    console.log(creds.verified[0])
  }).catch( err => {
    console.log("oops")
  })
})

// run the app server and tunneling service
const server = app.listen(8088, () => {
    ngrok.connect(8088).then(ngrokUrl => {
        endpoint = ngrokUrl
        console.log(`Request Verification Service running, open at ${endpoint}`)
    })
})
