require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const sgMail = require('@sendgrid/mail');

const PORT = 8080;

// require routes
const authRoute = require('./routes/auth');
const courseRoute = require('./routes/course');
const userRoute = require('./routes/user');
const assignmentRoute = require('./routes/assignment');
const postRoute = require('./routes/post');
const mcqRoute = require('./routes/questions/mcq');
const truefalseRoute = require('./routes/questions/truefalse');
const codingQuestionRoute = require('./routes/questions/coding-question');
const testRoute = require('./routes/test');
const practiceRoute = require('./routes/practice');
const ideRunnerRoute = require('./routes/ide/runner');
const getIdeCodeRoute = require('./routes/getidecode');
const app = express();

// use cors
app.use(cors());

app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// body parser
app.use(bodyParser.urlencoded({extended:true,limit:'20mb'}));
app.use(bodyParser.json({limit:'20mb'}));

// use app routes
app.use(authRoute);
app.use('/course', courseRoute);
app.use('/user', userRoute);
app.use('/assignment', assignmentRoute);
app.use('/post', postRoute);
app.use('/mcq', mcqRoute);
app.use('/truefalse', truefalseRoute);
app.use('/codingQuestion',codingQuestionRoute);
app.use('/test',testRoute);
app.use('/practice',practiceRoute);
app.use(ideRunnerRoute);
app.use('/CodeofIDE',getIdeCodeRoute);

// connect with mongoose
mongoose.connect(process.env.MONGODB,
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, (err) => {
    if(err) {
        console.log(err);
        return;
    };
    app.listen(process.env.PORT || PORT, () =>{
        console.log(`Server Running on Port ${PORT}`);
    })  
});
sgMail.setApiKey(process.env.SENDGRID);
