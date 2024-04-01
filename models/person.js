const mongoose = require('mongoose')

// creating the scehma using mongoose
const multer=require('multer')
const upload = multer().single('avatar')
const bcrypt = require('bcrypt');

const personSchema = new mongoose.Schema({
    avatar:{
        type:String,
        required:true,
     
    },
    coverImage:{
        type:String,
       
       
    },
    name:{
        type:String,
        required:false,
    },
    age:{
        type:Number
    },
    work:{
        type:String,
        enum:['chef','manager','waiter'],
        required:[true,'work is required field'], 
    },
    mobile:{
        type:Number,
        required:true,
    },
    email:{
        type:String,
        unique:true
    },
    address:{
        type:String,
        required:true,
    },
    salary:{
        type:Number,
        required:true
    },
    username:{
        required:true,
        type:String,
        unique:true
    },
    password:{
        required:true,
        type:String
    }
});

// personSchema.methods.comparePassword= async function(candidatePassword){
//     try{
//         const isMatch=await bcrypt.compare(candidatePassword,this.password)
//         return isMatch;

//     }catch(err){
//         throw err
//     }
// }



const Person = mongoose.model('Person', personSchema);

module.exports = Person;

