const https = require('https')
const request = require('request')
const fs = require('fs')
const cors = require('cors')
const express = require('express')
const app = express()

const APP_NAME = 'ubike-map'
const APP_PORT = 3000

app.use(cors())

app.set("view options", { layout: false })
app.use(express.static(__dirname + '/../views'))
app.use(express.static(__dirname + '/../src'))

app.engine('html', require('ejs').renderFile);

app.get('/', (req, res) => {
  res.render('index.html')
})

if (process.env.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync(process.env.UBIKE_MAP_KEY_PATH),
    cert: fs.readFileSync(process.env.UBIKE_MAP_CERT_PATH)
  };
  https.createServer(options, app).listen(APP_PORT);
} else {
  app.listen(APP_PORT, () => {
    console.log(APP_NAME + ' listen on port ' + APP_PORT)
  })
}
