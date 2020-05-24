const Test = require('../models/test');
const UserTestRecord = require('../models/user-test-record');

module.exports = async (req,res,next) => {
    const groupId = req.groupId;
    const test_Id = req.test_Id;

    const test = await Test.findById(test_Id);

    if(!test){
        res.status(500).json({message:'Try Again'});
        return;
    }

    let d = new Date().toLocaleString('en-In');
    let grp = test['groups'].find(obj=>obj.groupId==groupId);

    if(!grp){
        res.status(500).json({message:'Try Again'});
        return;
    }

    if(d > new Date(grp['startTime']).toLocaleString() && d < new Date(grp['endTime']).toLocaleString()){
        next();
    }

    res.status(200).json({message:'Test Over.',ended:true});

}