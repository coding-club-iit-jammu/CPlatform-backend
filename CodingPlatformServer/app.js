const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');


const authRoute = require('./routes/auth');
const courseRoute = require('./routes/course');
const userRoute = require('./routes/user');
const assignmentRoute = require('./routes/assignment');
const postRoute = require('./routes/post');
const mcqRoute = require('./routes/questions/mcq');
const truefalseRoute = require('./routes/questions/truefalse');

const app = express();

app.use(cors());


app.use(bodyParser.urlencoded({extended:true,limit:'20mb'}));
app.use(bodyParser.json({limit:'20mb'}));
app.use(authRoute);
app.use('/course', courseRoute);
app.use('/user', userRoute);
app.use('/assignment', assignmentRoute);
app.use('/post', postRoute);
app.use('/mcq', mcqRoute);
app.use('/truefalse', truefalseRoute)

mongoose.connect("mongodb+srv://pratikparmar:dafiQxSJ4qttuhwr@cluster0-ihjbl.mongodb.net/CodingPlatform?retryWrites=true&w=majority",{useNewUrlParser: true,useUnifiedTopology: true},(err)=>{
    if(err){
        console.log(err);
        return;
    }
    app.listen(8080,() =>{
        console.log("Server Running on Port 8080");
    })  
})