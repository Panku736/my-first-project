// creating server using express
require('dotenv').config()
const express=require('express')
const db=require('../db.js')
const app=express()
const personJs=require('../models/person.js')

const postRoutes=require('../routes/postRoutes.js')
const personRoutes=require('./routes/personRoutes.js')




const bodyParser = require('body-parser');// it help to convert data from user or client of any form data ie json, formdata, url coded data , so it help to convert the data from user to java script object data 

// it saves data in req.bodyn
// Middleware to parse JSON bodies
app.use(bodyParser.json()) // using middleware bodyparser and this is syntax to use body parser app.use(bodyParser.json());


// middle ware functon syntax 

const logRequest=(req,res,next)=>{
    console.log(`${new Date()} request made to : : ${req.originalUrl}` )
    next(); // logreqfunctin complete then it has to go to next function if not next it will not go to next function
}
app.use(logRequest)
// change




app.use('/person',personRoutes);
app.use('/post',postRoutes);



app.get('/person/home/page',(req,res)=>{
    res.send('server ok 3600')
})



// parameterized api on type of work


app.listen(process.env.Port_Number,()=>{
    console.log('server 3600 active')
})

