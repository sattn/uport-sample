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
    appName: 'Create Verification Example',
    did: 'did:ethr:0x55dc438e5a5ec9adc8a55830d09e1b806afa205c',
    privateKey: '4959541f9ad23ae9386b5b9b586256febe3f452d7552d3b955f818ebaba27543'
})

app.get('/', (req, res) => {
    credentials.createDisclosureRequest({
        verified: ['Identity'],
        notifications: true,
        callbackUrl: endpoint + '/callback'
    }).then(requestToken => {
        console.log(decodeJWT(requestToken))  //log request token to console
        const uri = message.paramsToQueryString(message.messageToURI(requestToken), {callback_type: 'post'})
        const qr =  transports.ui.getImageDataURI(uri)
        res.send(`
          <main className="container">
            <div className="pure-g">
              <div className="pure-u-1-1">
                <h1>University Page</h1>
                <p>本人確認を行い、学歴証明書を発行するページです。</p>
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

    console.log('university callback')
    console.log(jwt)
    console.log(decodeJWT(jwt))
    
    credentials.authenticateDisclosureResponse(jwt).then(creds => {
      console.log('university callback - creds res')
      console.log(creds)
      console.log(creds.verified[0])
      // take this time to perform custom authorization steps... then,
      // set up a push transport with the provided 
      // push token and public encryption key (boxPub)
      const push = transports.push.send(creds.pushToken, creds.boxPub)
  
      // 学歴証明書の有効期限は３カ月と仮定
      credentials.createVerification({
        sub: creds.did,
        exp: Math.floor(new Date().getTime() / 1000) + 90 * 24 * 60 * 60,
        claim: {'CertOfEducation' : {'Last Seen' : `${new Date()}`, 'University Name': 'Faber', 'Grade': 'A'}}
        // Note, the above is a complex (nested) claim. 
        // Also supported are simple claims:  claim: {'Key' : 'Value'}
      }).then(attestation => {
        console.log(`Encoded JWT sent to user: ${attestation}`)
        console.log(`Decodeded JWT sent to user: ${JSON.stringify(decodeJWT(attestation))}`)
        return push(attestation)  // *push* the notification to the user's uPort mobile app.
      }).then(res => {
        console.log(res)
        console.log('Push notification sent and should be recieved any moment...')
        console.log('Accept the push notification in the uPort mobile application')
        ngrok.disconnect()
      })
    })
  })
  
// run the app server and tunneling service
const server = app.listen(8088, () => {
    ngrok.connect(8088).then(ngrokUrl => {
        endpoint = ngrokUrl
        console.log(`Create Verification Service running, open at ${endpoint}`)
    })
})
