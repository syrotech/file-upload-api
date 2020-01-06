// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for Uploads
const Upload = require('../models/Upload')

const s3Upload = require('../../lib/s3-Upload')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { Upload: { title: '', text: 'foo' } } -> { Upload: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /Uploads
router.get('/uploads', requireToken, (req, res, next) => {
  Upload.find()
    .then(Uploads => {
      // `Uploads` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return Uploads.map(Upload => Upload.toObject())
    })
    // respond with status 200 and JSON of the Uploads
    .then(Uploads => res.status(200).json({ Uploads: Uploads }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /Uploads/5a7db6c74d55bc51bdf39793
router.get('/Uploads/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Upload.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "Upload" JSON
    .then(Upload => res.status(200).json({ Upload: Upload.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /Uploads
router.post('/uploads', (req, res, next) => {
  // set owner of new upload to be current user
  // req.body.upload.owner = req.user.id
  s3Upload('text-test.txt', 'Hello World!')
    .then(data => {
      return Upload.create({
        fileName: data.key,
        fileType: 'NA',
        fileUrl: data.Location
      })
    })
    // respond to succesful `create` with status 201 and JSON of new "upload"
    .then(upload => {
      res.status(201).json({ upload: upload.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /Uploads/5a7db6c74d55bc51bdf39793
router.patch('/Uploads/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.Upload.owner

  Upload.findById(req.params.id)
    .then(handle404)
    .then(Upload => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, Upload)

      // pass the result of Mongoose's `.update` to the next `.then`
      return Upload.updateOne(req.body.Upload)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /Uploads/5a7db6c74d55bc51bdf39793
router.delete('/Uploads/:id', requireToken, (req, res, next) => {
  Upload.findById(req.params.id)
    .then(handle404)
    .then(Upload => {
      // throw an error if current user doesn't own `Upload`
      requireOwnership(req, Upload)
      // delete the Upload ONLY IF the above didn't throw
      Upload.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
