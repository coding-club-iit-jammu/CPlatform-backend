const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const admin = require('firebase-admin');
const client  = redis.createClient();
const router = express.Router();
const app = express();

var serviceAccount = {
    "type": "service_account",
    "project_id": "codingplatform-c9738",
    "private_key_id": "e523326f11e9732a61762f6cca7c5064840eed73",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCSdYMAonM3oNlb\noLSZgKdMGj8qaoC/gsri+k9mgNKtDpYAViyErnqEKaartlTsHSdZkw8T84OEHYxW\nSvqNiRxyqtIEKqgMHtj1Rm5cZskhmg3nrhReR2mFa9ZjGW6V6Na20jDz6F89/fTw\nxGL+kvrj3+ivBEf6Vv0Lg6ZlXi7HFjOe1bm1jfJayw5E+r3v04iIa0Bd1AOp2n0C\n1JDsnqcslXg6SxbCwsEssfU6fqViEw8+IPHX9VnRhe1RzLidGDPqZ90UKLz2ABik\nvmSATjs6TUPLV6Qh114wOzQlLiQYwtu+ScZZbaLuHJ+knm4U1BYhn0egwyG/ga/a\nkcLmMnkbAgMBAAECggEAEvMwzm3hLzXDtJmtjx2uB9MZkIO+lt5LIWU2eCfQ7+Ku\n6+o6e7cWU8Vj3bHgzmV98uwWi66lZKcXbQ7p2P2q+EyRPJ1xqD0m4KLf+AVgntVl\nA9tqopbmLgTkShGUqmw5uTv8aNgMgrk6Q8YqnOUoS0BscJYYOL71TNPC6DjFyq0q\n75aR4TjEcr6bSu1zCW1VE3BvXq5KnDpbU8NXrCO/2vqHe/cTLrfvdbS2PVwm7Imi\nBbjyedCA1A++/P0z3TvN48OjsCcyJ1j7OzeByDbN+uh4N9FDfMmpfRPbEwCOI11f\nn3SIbiWuBq1E4SYrge1GRGw90dBBJjlBjLgLRrSKkQKBgQDGLttNpLJLPUrNYVqT\nD8/zhazXmF08sSdUiuv2C2eP/jHYCGwuImWN7bgi7PjdHqugHKEsVc0HXsJO3Km8\nYE2NGtI3nZ2U7MWvRb/OE7vJp7I1m3WdFz6BcEF6hxDzVkoK0xoF8usOM6LAAEgZ\nnkEAgrQHqASRWKrhGlOl5o7UqQKBgQC9L7BP3/N2Yiat1AkMU562bX/2VpOma9Mp\npvl6YYJng7v/ZhJ/rCzACDyIXZytgRr5+S++BLq0ELXSGaz80/4SP9/4XuX6do/N\nH1oiJCOPerjUMZbV4XQxgsKaljSVWDp5cZZMyGwsw43nIvO4VqFUBbXL49Sk4Epu\nfH0cD2n2IwKBgQCas3zxMP0UinXXuIURgyha+iAf84nklI0VC5SB7gkbd9vEvV5k\n7OjFT6mLadwiD4z9YRvXFesEM84N7WZ569rdqPAsBdc6p1DxLss4vGK8WTFdc0ru\nI3ThaZVTZhevO850gLExr5wY6+nBYvblOImZMm4CA//8zXAmY3ykZkNccQKBgHai\nlhSwolKlYA33fikNsuRBLFJEnlhpG0TuYVmeFhFlqZmR353SUUmmoJb+5QZkhI8m\n9Qpamt3Z8LqswS7WnWfCSGfO0rbKbIi71WC9etM5qPfflO/QbnWxwuj/sj/I0Pph\nAVhrAnLbunusDluVb5tp7UPLPgiaYfKA/E+BVvgzAoGAMPOtVqdKreNJnjIJzuqJ\nU0df+/dS+qo5qE6HpRlqpzkx0ISSm3eVHw3U1h74ESeN7EtNbr35PY0DZC09XYZD\n//8c8EFnHZNgKDZm6kZAKDzldkouWMOCCDfUqM1ENkl1i9lG34a2siieVHnmluh9\nlIArAsGRVrD4E+oCfNLZ+zY=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-3spln@codingplatform-c9738.iam.gserviceaccount.com",
    "client_id": "106982825456587167459",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-3spln%40codingplatform-c9738.iam.gserviceaccount.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://codingplatform-c9738.firebaseio.com"
});

app.use(session({
    secret: 'Secret',
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : 26000}),
    saveUninitialized: false,
    resave: false
}));

app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  })

router.post('/testInit',async (req,res) => {
    try{
    req.session.key = req.body.username;
    var userid = req.body.username;
    let quizId = req.body.quizCode;
    let course = req.body.courseCode;
    var database = admin.database();
    var temp;
    var testNo = quizId.substring(0,4);
    var groupNo = quizId.substring(4).toString()
    await database.ref('courses').child(course).child(course.substring(8)).child('tests').child(testNo).child(groupNo).child("students").once('value',function(snapshot){
        temp = snapshot.val();
    })
    console.log(temp)
    res.json({"names":"Hi"});
    } catch(e){
        console.log(e)
    }    
});

router.get('/clearSession',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });

});

router.post('/sendHelloWorld', (req,res)=>{
    res.end("Hello WOrld")
})

app.use('/', router);

app.listen(process.env.PORT || 3000,() => {
    console.log(`App Started on PORT ${process.env.PORT || 3000}`);
});