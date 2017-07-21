const express = require('express')
const app = express()

const APP_NAME = 'ubike-map'
const APP_PORT = 3000

app.set("view options", { layout: false })
app.use(express.static(__dirname + '/../views'))
app.use(express.static(__dirname + '/../src'))

app.engine('html', require('ejs').renderFile);

app.get('/', (req, res) => {
  res.render('index.html')
})

app.listen(APP_PORT, () => {
  console.log(APP_NAME + ' listen on port ' + APP_PORT)
})
