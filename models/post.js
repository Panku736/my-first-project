const mongoose = require('mongoose');

const person=require('./person')

const pictureSchema = new mongoose.Schema({

    post: {
        type: String,
        required: true,
        data: Buffer
    },

    description: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    },

    caption: {
        type: String,
        required: true
    },


    createdAt: {
        type: Date,
        default: Date.now
    },


    updatedAt: {
        type: Date,
        default: Date.now
    }
});


const uploadPost = mongoose.model('picture', pictureSchema);

module.exports = uploadPost;

