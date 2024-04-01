const express = require('express')
const multer  = require('multer')
const path = require('path');
const app = express()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, '../uploadFiles'))
    },
    filename: function (req, file, cb) {
     
      cb(null, file.originalname)
    }
  })
  
 const upload = multer({ storage: storage })
 module.exports=upload


 

  // it is middleware used to upload file first to local storage  and then to cloudinary
 