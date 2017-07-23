const request = require('request')
const fs = require('fs')

const dataResource = new Promise((resolve, reject) => request(
  'http://data.ntpc.gov.tw/api/v1/rest/datastore/382000000A-000352-001',
  (err, res, body) => {
    resolve(body)
  }
))

// dataResource.then(data => {
//   if (data) {
//     writeIntoFile(data, 'ubike-db.json')
//   }
// })

const taipeiDataResource = new Promise((resolve, reject) => request(
  {
    method: 'GET',
    uri: 'http://data.taipei/youbike',
    gzip: true
  }, (err, res, body) => {
    resolve(body)
  }
))

Promise.all([dataResource, taipeiDataResource]).then(data => {
  if (data) {
    const parseTaipeiDataIntoJSON = JSON.parse(data[1])
    const serializeDataIntoObject = Object.keys(parseTaipeiDataIntoJSON.retVal).map(key => {
      return parseTaipeiDataIntoJSON.retVal[key]
    })
    const concatTwoCityData = JSON.parse(data[0]).result.records.concat(serializeDataIntoObject)
    const stringifyData = JSON.stringify(concatTwoCityData)
    writeIntoFile(stringifyData, 'ubike-db.json')
  }
})

function writeIntoFile(json, filename) {
  fs.writeFile(__dirname + '/../src/api/v1/' + filename, json, 'utf8', (err) => {
    if (err) {
      throw new Error(err)
    }
    console.log('ubile.json File Save.')
  })
}
