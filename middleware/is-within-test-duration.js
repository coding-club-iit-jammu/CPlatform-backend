const Test = require('../models/test');
const UserTestRecord = require('../models/user-test-record');

module.exports = async (req,res,next) => {
    const groupId = req.groupId;
    let test_Id;

    if(req.method == 'GET'){
        test_Id = req.query.test_id;
    } else if(req.method == 'POST'){
        test_Id = req.body.test_id;
    }

    const test = await Test.findById(test_Id);

    if(!test){
        console.log("Failing in withing test duration file.");
        res.status(500).json({message:'Try Again'});
        return;
    }

    let d = new Date();
    let grp = test['groups'].find(obj=>obj.groupId==groupId);

    if(!grp){
        res.status(500).json({message:'Try Again'});
        return;
    }

    if(d > new Date(grp['startTime']).getTime() && d < new Date(grp['endTime']).getTime()) {
        next();
        return;
    }
    res.status(200).json({message:'Test Over.',ended:true});

}