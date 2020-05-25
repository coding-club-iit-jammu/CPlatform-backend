const jwt = require('jsonwebtoken');
const jwtConfig = require('../jwtConfig');

const accessTokenSecret = jwtConfig.accessTokenSecret;
const refreshTokenSecret = jwtConfig.refreshTokenSecret;

function verifyJWTToken(token) {
    return new Promise((resolve, reject) => {
        if (!token.startsWith('Bearer')) {
            return reject('Token is invalid');
        }
        token = token.slice(7);
        jwt.verify(token, accessTokenSecret, (err, decodedToken) => {
        if (err) {
            return reject(err.message);
        }
        if (!decodedToken || !decodedToken.userId) {
            return reject('Token is invalid');
        }   
        resolve(decodedToken);
     })
    });
}


module.exports = async (req,res,next) => {
    
    const token = req.get('Authorization');
    if (!token) {
        res.status(401).send('Token is invalid');
    } 

    verifyJWTToken(token).then(user => {
        req.userId = user.userId;
        req.userEmail = user.email;
        next();
    }).catch(err => {
        console.log("JWT Verification failed.");
        res.status(401).send(err);
    });

};