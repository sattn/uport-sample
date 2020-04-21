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
    did: 'did:ethr:0xdf93f0efb3b9b61aefbe21f7d7ea4b9ecf248410',
    privateKey: '0ea6e8a71c7a5fe8dfd525afff7275ecb6b538d71f93204f8f639ad5dff65359'
})

app.get('/', (req, res) => {
    credentials.createDisclosureRequest({
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
                <h1>Fake Goverment Page</h1>
                <p>市役所の偽ページです。同じキー情報でクレーム発行できるのかな？</p>
                <h2>本人証明書の発行</h2>
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
    credentials.authenticateDisclosureResponse(jwt).then(creds => {
      // take this time to perform custom authorization steps... then,
      // set up a push transport with the provided 
      // push token and public encryption key (boxPub)
      const push = transports.push.send(creds.pushToken, creds.boxPub)

      // 身分証明書の有効期限は６カ月間と仮定
      credentials.createVerification({
        sub: creds.did,
        exp: Math.floor(new Date().getTime() / 1000) + 180 * 24 * 60 * 60,
        claim: {'Identity' : {'Last Seen' : `${new Date()}`, 'First Name': 'Jirou', 'Familly Name': 'Yamada', 'Birthday': '2000/12/11'}}
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
