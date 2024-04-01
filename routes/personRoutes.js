const express=require('express')
var jwt = require('jsonwebtoken');


const app=express()
const util=require('util')

const router= express.Router()
const {verifyToken}=require('../../middlewares/auth.js')

const upload = require("../../middlewares/multerMiddleware.js");
const bcrypt=require('bcrypt')
const uploadOnCloudinary=require('../../utils/cloudinary.js')
const mongoose=require("mongoose")
const personJs=require('../../models/person.js')

const post=require('../../models/post.js');
const { decode } = require('punycode');


router.get('/profile', verifyToken, async function (req, res) {
    try {
        // Access userId from req object
        const userId = req.userId;
        // Now you can use userId as needed
        const personProfile=await personJs.find({_id: userId} ).select("-password -__v")
        // Example usage: Sending userId in the response
        res.status(200).json({ success: true, personProfile});
    } catch (error) {
        // Handling unexpected errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

  
  

router.get('/:workType',verifyToken,async(req,res)=>{
    try{
        const workType=req.params.workType;
        if(workType=='chef' || workType=='manager'||workType=='waiter'){
            const response= await personJs.find({work:workType})
            console.log('data fetched parametrized end pt')
            res.status(200).json(response)
        }else{
            res.status(404).json({error:'invalid work type'})
        }
    }catch(err){
        console.log('error in saving data', err)
        res.status(500).json({err: 'internal server error'})
    }   

})

 
router.get('/',verifyToken,async(req,res)=>{
    try {
        
     const data = await personJs.find(req.query)// person.js is where data is svd// req.query= query filter 
     console.log('data fetched')
     console.log(req.query)  
     const responseData = {
        data: data,
        length: data.length,
        message: 'Data fetched successfully.'
    }
     res.status(200).json(responseData);

} // we use try and catch block
    catch(err){
        console.log('error in saving data', err)
        res.status(500).json({err: 'internal server error'})
    }      
})
// it help to read data of person 



router.post('/add', upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), async (req, res) => {
    try {
        const data = req.body; // req.body contains the new person data
        const exist = await personJs.findOne({ email: data.email });
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        if (exist) {
            return res.status(400).json({ message: 'email already exists' });
        }

        if (!req.files || !req.files.avatar || !req.files.coverImage) {
            return res.status(400).json({ message: 'avatar and cover image are required' });
        }

        const avatarLocalPath = req.files.avatar[0].path;
        const coverImageLocalPath = req.files.coverImage[0].path;

        if (!avatarLocalPath || !coverImageLocalPath) {
            return res.status(400).json({ message: 'avatar and cover image paths are required' });
        }

        const uploadAvatar = await uploadOnCloudinary(avatarLocalPath);
        const uploadCoverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!uploadAvatar || !uploadCoverImage) {
            return res.status(400).json({ message: 'upload avatar and cover image is required' });
        }

        if (!uploadAvatar.url || !uploadCoverImage.url) {
          console.log("uploadAvatar.secure_url" ,uploadAvatar)
            return res.status(400).json({ message: 'secure URLs for avatar and cover image are required' });
        }
        
        const newPerson = new personJs({
            ...data,
            password: hashedPassword,
            avatar: uploadAvatar.secure_url,
            coverImage: uploadCoverImage.secure_url
        });
        // routes 
        const savedPerson = await newPerson.save();
        console.log('data saved');
        res.status(200).json({ message: 'Data saved successfully'});
    } catch (error) {
        console.log("error is ", error);
        res.status(500).json({ err: 'internal server error' });
    }
});

//shcemaData

router.put('/update/:id',verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        // console.log('Received ID:', id); // Logging the received ID
        if (req.body.password) {
            const hashedUpdatedPassword = await bcrypt.hash(req.body.password, 10);
            console.log('hashed pass:', hashedUpdatedPassword)
            req.body.password = hashedUpdatedPassword;
        }
        const updatedPersonData = req.body;

        console.log('Received Data:', updatedPersonData); // Logging the received data
        const response = await personJs.findByIdAndUpdate(id, updatedPersonData, {
            new: true,
            runValidators: true
        }); 

        console.log('Response:', response); // Logging the response
        
        console.log('data updated');  
        res.status(200).json({
            success:true,
            message:'update success'
        });
    } catch (err) {
        console.log('error in saving data', err);
        res.status(500).json({ err: 'internal server error' });
    }
});
 
 
// for deleting the record

router.delete('/:id',verifyToken,async(req,res)=>{
    try{
        const personid= req.params.id;
        const response=await personJs.findByIdAndDelete(personid)
        console.log('data deleted')
        res.status(500).json({message : 'data deleted succesfully'})
    }catch{
        console.log('error in saving data', err);
        res.status(500).json({ err: 'internal server error' });
      
    } 
}) 
// login



router.post('/login', async (req, res) => {
    try {
        // const { username, password } = req.body;
        const username=req.body.username; 
        const password=req.body.password;
        // console.log('username and password ' ,username, password)
        // Check if both username and password are provided
        if (!username || !password) {         
            return res.status(400).json({ error: 'Username and password are required' });
        }
        let user = await personJs.findOne({ username });


        // console.log(user)
        if (!user) {  
            return res.status(404).json({ error: 'User not found' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }      
         user = await personJs.findOne({ username }).select("-password -__v");

        // verify a token symmetric - synchronous 
       
        const token = jwt.sign({ userId: user._id,name:user.name,email:user.email }, process.env.SECRET_KEY, { expiresIn: 300000 }); // Change 'your_secret_key' to a secure secret key
        
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 }); // Expires in 1 hour

        res.status(200).json({ token, userData: user, message: 'Login successful' });
} catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/upload', verifyToken, upload.single('post'), async (req, res) => {
    try {
        // Check if file is provided
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        // console.log("req.file is herer " ,req.file)
        // Create a new picture object
        const userDetails=await personJs.findById(req.userId)
        const username = userDetails.name;
        console.log('exact name is here : ', username)
        const newPicture = new post({
            post: req.file.path, // Assuming 'path' contains the path to the uploaded file
            description: req.body.description,
            user: username, // Assuming userId is extracted from the token in the verifyToken middleware
            caption: req.body.caption
        });
    

        // Save the picture object to the database 'picture validation failed'
        const savedPicture = await newPicture.save();

        // Send success response Picture
        res.status(200).json({ success: true, post: savedPicture });
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


router.get('/profile/pic', verifyToken, async function (req, res) {
    try {
        // Access userId from req object
        const userId = req.userId;
        // Now you can use userId as needed
        const personProfile=await personJs.find({_id: userId} ).select("-password -__v -age -name -salary -address -email -work -mobile -_id -username")
        // Example usage: Sending userId in the response
        // if (personProfile && personJs) {
            // Send avatar from personProfile in the response
            res.status(200).json({ success: true,  personProfile });
        } 
     catch (error) {
        // Handling unexpected errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;

module.exports = router;

