// File is for command-line testing
// uploading files to AWS S3

// require AWS-SDK "Software Development Kit" package file
const AWS = require('aws-sdk')
// not sure if we need this, but require AWS-UUID package file
const uuid = require('uuid')

// Define bucket name to use
const bucket = `janinasbucket`

// Create S3 service module instance
const s3 = new AWS.S3()
console.log(s3)
