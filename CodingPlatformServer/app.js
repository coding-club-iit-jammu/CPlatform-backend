const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoute = require('./routes/auth');
const courseRoute = require('./routes/course');
const userRoute = require('./routes/user');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(authRoute);
app.use('/course',courseRoute);
app.use('/user',userRoute);

mongoose.connect("mongodb+srv://pratikparmar:dafiQxSJ4qttuhwr@cluster0-ihjbl.mongodb.net/CodingPlatform?retryWrites=true&w=majority",{useNewUrlParser: true,useUnifiedTopology: true},(err)=>{
    if(err){
        console.log(err);
        return;
    }
    app.listen(8080,() =>{
        console.log("Server Running on Port 8080");
    })  
})