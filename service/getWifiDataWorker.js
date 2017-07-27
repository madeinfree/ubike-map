const request = require('request')
const fs = require('fs')

const wifiDataResource = new Promise((resolve, reject) => request(
  'http://data.ntpc.gov.tw/od/data/api/04958686-1B92-4B74-889D-9F34409B272B?$format=json',
  (err, res, body) => {
    resolve(body)
  }
))

wifiDataResource.then(res => {
  const data = res
  writeIntoFile(data, 'wifi-db.json')
})

function writeIntoFile(json, filename) {
  fs.writeFile(__dirname + '/../src/api/v1/' + filename, json, 'utf8', (err) => {
    if (err) {
      throw new Error(err)
    }
    console.log(`${filename} File Save.`)
  })
}
