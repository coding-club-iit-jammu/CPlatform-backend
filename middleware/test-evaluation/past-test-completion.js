const Test = require('../../models/test');

module.exports = async (req,res,next) => {
    let test_Id;

    if(req.method == 'GET'){
        test_Id = req.query.test_id;
    } else if(req.method == 'POST'){
        test_Id = req.body._id;
    }

    const test = await Test.findById(test_Id);

    if(!test){
        res.status(500).json({message:'Try Again'});
        return;
    }

    let d = new Date();
    for(let grp of test['groups']){
        if(d < new Date(grp['endTime']).getTime()) {
            res.status(200).json({message:`Test not over yet. Please Wait.`});
            return;
        }
    }

    next();

}