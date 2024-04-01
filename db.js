// this file help to establish connection between node js and mongoDb data base by using mongoose
const mongoose= require('mongoose')

const mongoUrl='mongodb://127.0.0.1:27017/restau'   //we decide restaurant
// it help to establish connection bw node js and mongoose
// Connect to MongoDB
mongoose.connect(mongoUrl) //// it help to establish connection bw node js and mongoose


const db = mongoose.connection;

db.on('connected',()=>{
    console.log('connected to mongo db and mongoose')
})

db.on('error',(err)=>{
    console.log('error', err)
})


db.on('disconnected',()=>{
    console.log('disconnected to mongo db and mongoose ')
})

module.exports=db;







