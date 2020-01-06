// setup credentials in .env file at top of page
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
// https://www.npmjs.com/package/dotenv
require('dotenv').config()

// File is for command-line testing
// uploading files to AWS S3

// require AWS-SDK "Software Development Kit" package file
const AWS = require('aws-sdk')
// not sure if we need this, but require AWS-UUID package file
// const uuid = require('uuid')

// Define bucket name to use
const bucket = `janinasbucket`

// Create S3 service module instance
const s3 = new AWS.S3()
console.log(s3)

// Create object of params for putObject
// call:

module.exports = (key, body) => {
  // Create object of params for upload call:
  const params = {
    Bucket: bucket,
    ACL: 'public-read'
  }
  return new Promise((resolve, reject) => {
    params.Key = key
    params.Body = body
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// const uploadPromise = s3.upload(params).promise()
// uploadPromise.then(data => {
//   console.log(data)
// })
//   .catch(console.error)
// or,
// s3.putObject(params).promise()
// .then(console.log)
// .catch(console.error)
