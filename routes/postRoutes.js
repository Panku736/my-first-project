const express=require('express')
var jwt = require('jsonwebtoken');


const app=express()

const util=require('util')

const router= express.Router()
const {verifyToken}=require('../middlewares/auth.js')

const upload = require("../middlewares/multerMiddleware.js");
const mongoose=require("mongoose")
const personJs=require('../models/person.js')

const post=require('../models/post.js');
const { decode } = require('punycode');








router.get('/available', verifyToken, async function (req, res) {
    try {
        // Access userId from req object
        const userId = req.userId;
        console.log (userId)
        // Now you can use userId as needed
        const personProfile=await personJs.find({_id: userId} ).select("-password -__v -age -name -salary -address -email -work -mobile -_id -username")
       if(!personProfile){
       return res.status(400).json({ success: false, message: 'there is no person ' })
            
        } 
        const FindPost= await post.findOne({  user :userId})
        if(!FindPost){
            return res.status(400).json({ success: false, message: 'there is no post available ' })
        }
        res.status(200).json({ success: true, post: FindPost });
    }
     catch (error) {
        // Handling unexpected errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;



