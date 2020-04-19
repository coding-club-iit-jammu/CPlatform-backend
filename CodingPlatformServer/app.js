const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');


const authRoute = require('./routes/auth');
const courseRoute = require('./routes/course');
const userRoute = require('./routes/user');
const assignmentRoute = require('./routes/assignment');

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const app = express();

// app.use(fileUpload({
//     createParentPath: true
// }));

app.use(cors());


app.use(bodyParser.urlencoded({extended:true,limit:'20mb'}));
app.use(bodyParser.json({limit:'20mb'}));
app.use(authRoute);
app.use('/course',courseRoute);
app.use('/user',userRoute);
app.use('/assignment',assignmentRoute);

app.post('/upload-avatar',upload.single('avatar'), async (req, res) => {
    try {
        console.log(req);
        if(!req.file) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            
            let avatar = req.files.avatar;
            
            avatar.mv('./uploads/' + avatar.name);

            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

mongoose.connect("mongodb+srv://pratikparmar:dafiQxSJ4qttuhwr@cluster0-ihjbl.mongodb.net/CodingPlatform?retryWrites=true&w=majority",{useNewUrlParser: true,useUnifiedTopology: true},(err)=>{
    if(err){
        console.log(err);
        return;
    }
    app.listen(8080,() =>{
        console.log("Server Running on Port 8080");
    })  
})