const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
    try{
        jwt.verify(token,'ThisIsASecretKeyPratikParmarASDFGHJKLZXCVBNMQWERTYUIOP',(err,decode)=>{
            decodedToken = decode;
        })
    } catch(err){
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken){
        const error = new Error("Not Authenticated.");
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId;
    req.userEmail = decodedToken.email;
    next();


};