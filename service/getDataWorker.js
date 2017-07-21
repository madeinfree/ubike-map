const request = require('request')
const fs = require('fs')

const dataResource = new Promise((resolve, reject) => request(
  'http://data.ntpc.gov.tw/api/v1/rest/datastore/382000000A-000352-001',
  (err, res, body) => {
    resolve(body)
  }
))

dataResource.then(data => {
  if (data) {
    writeIntoFile(data)
  }
})

function writeIntoFile(json) {
  fs.writeFile(__dirname + '/../src/api/v1/ubike-db.json', json, 'utf8', (err) => {
    if (err) {
      throw new Error(err)
    }
    console.log('ubile.json File Save.')
  })
}
