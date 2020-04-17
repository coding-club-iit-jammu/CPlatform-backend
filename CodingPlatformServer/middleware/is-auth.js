const jwt = require('jsonwebtoken');

module.exports = async (req,res,next) => {
    
    //Getting Token from Header of Request.

    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
    try{
        jwt.verify(token,'ThisIsASecretKeyPratikParmarASDFGHJKLZXCVBNMQWERTYUIOP',(err,decode)=>{
            decodedToken = decode;
            if(!decodedToken){
                res.status(401).json({message:'Not Authenticated'});
                return;
            }
        
            req.userId = decodedToken.userId;
            req.userEmail = decodedToken.email;
            req.userName = decodedToken.name;
            next();
        })
    } catch(err){
        res.status(500).json({message:'Not Authenticated'});
        return;
    }
};