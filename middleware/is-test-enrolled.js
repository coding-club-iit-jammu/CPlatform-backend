const Test = require('../models/test');
const UserTestRecord = require('../models/user-test-record');

module.exports = async (req,res,next) => {
    const groupId = req.groupId;
    const testId = req.body.testId;//For 2019_02_CSL100T1
    const password = req.body.password;

    const test = await Test.findOne({testId:testId}).populate({
        path:'records',
        model:'UserTestRecord',
        select: 'userId',
        match:{
            userId: req.userId
        }
    });

    if(!test){
        console.log("Failing Here");
        res.status(500).json({message:'Try Again'});
        return;
    }

    let grp = test['groups'].find(obj=>obj.groupId==groupId);
    if(grp.password != password){
        res.status(200).json({
            message:'Wrong Password.'
        });
        return;
    }

    req.endTime = new Date(grp.endTime).toLocaleString('en-In');

    if(test['records'].length == 1){
        res.status(200).json({
            message:"Starting Test",
            userTestRecord:test['records'][0]._id,
            test_id:test._id,
            endTime:grp.endTime
        })
        return;
    }
    
    req.test = test;
    next();

}