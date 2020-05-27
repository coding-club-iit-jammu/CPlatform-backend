const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mcqSchema = new Schema({
    question:{
        type: String,
        required: true
    },
    used:{
        type: Boolean,
        default: false
    },
    options:[{
        code:{
            type: String,
            required: true
        },
        option:{
            type: String,
            required: true
        },
        isCorrect:{
            type: Boolean,
            required: true,
            default: false
        }
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
    console.log("Adding option",opt);
    return mcqOption.save();
}

mcqSchema.methods.addOptions = async function(options){
    
    const add_options= new Promise((resolve, reject) => {
        let i = 0;
        let len = options.length;
        this.options = [];
        console.log("Adding options",options);
        options.forEach(async option => {
            const {_id} = await addOption(option)
            if(_id){
                console.log("Option Added",_id);
                this.options.push(_id);
            }
            i++;
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