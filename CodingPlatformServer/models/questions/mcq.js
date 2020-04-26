const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MCQOption = require('./mcq-option');

const mcqSchema = new Schema({
    question:{
        type: String,
        required: true
    },
    options:[{
        type: Schema.Types.ObjectId,
        ref: 'MCQOption'
    }]
});

 const addOption = async (option)=>{
    const code = option.code;
    const opt = option.option;
    const isCorrect = option.isCorrect;
    
    const mcqOption = new MCQOption({
        code : code,
        option: opt,
        isCorrect: isCorrect
    });

    return mcqOption.save();
}

mcqSchema.methods.addOptions = async function(options){
    
    const add_options= new Promise((resolve, reject) => {
        let i = 0;
        let len = options.length;
        this.options = [];
        options.forEach(async option => {
            const {_id} = await addOption(option)
            if(_id){
                this.options.push(_id);
            }
            if (i === len -1){ 
                resolve();
            }
        });
    });
    return await add_options.then(()=>{
        return this.save();
    }).catch((err)=>{
        console.log(err);
    })
}

const MCQ = mongoose.model('MCQ',mcqSchema);


module.exports = MCQ;