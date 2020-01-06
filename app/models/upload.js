const mongoose = require('mongoose')

const uploadSchema = new mongoose.Schema({
  fileType: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Upload', uploadSchema)
