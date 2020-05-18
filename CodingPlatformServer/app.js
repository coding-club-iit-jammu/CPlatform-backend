const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
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
const app = express();

// use cors
app.use(cors());

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

// enable cross origin
function enableCrossOrigin() {
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (origin && typeof origin === 'string') {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        next();
    });
};

if (process.env.NODE_ENV != 'test') {
    enableCrossOrigin();
}

// connect with mongoose
mongoose.connect("mongodb+srv://pratikparmar:dafiQxSJ4qttuhwr@cluster0-ihjbl.mongodb.net/CodingPlatform?retryWrites=true&w=majority",
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