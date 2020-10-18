const CodeOfIDE = require('../models/idecode');

exports.getCode=(req,res,next)=>{
	CodeOfIDE.find({email: req.userEmail}).then(async (code)=>{
		
		if(code)
		{
			res.json({
				status:200,
				data:code
			})
			return;
		}
		else {
			res.status(400).json({message: 'User not found'})
		}	
			
		
	})
}

exports.saveCode =(req,res)=> {
	var idecode = new CodeOfIDE();
	idecode.email = req.body.email;
	idecode.cpp = "#include <iostream> \n using namespace std; \n int main () { \n cout << \"hello world\"; \n return 0; \n }";
	idecode.java = "class Main { \n public static void main(String[] args) { \n System.out.println(\"hello world\"); \n } \n };";
	idecode.python = "print('hello world')";
	idecode.save(err=>{
		res.json({
			status: 200,
			data: idecode
		})
	})
}

exports.autosave = (req,res)=> {

	CodeOfIDE.findOneAndUpdate({email: req.body.email},{cpp:req.body.cpp, python:req.body.python, java:req.body.java},function(err,id){
		if(err){
			res.json({
				status:500,
				message: 'failed to update'
			})
		}
		else
		{
			res.json({
				status:200,
				message: 'successfully updated',
				data: id
			})
		}
	})
}

exports.fetchPrevSubmission=(req,res)=>{
	CodeOfIDE.find({email: req.userEmail}).then(async(code)=>{
		if(code)
		{
			res.json({
				status:200,
				data:code
			})
			return;
		}
		else {
			res.status(400).json({message: 'submission not found'})
		}	
	})
}

exports.updatePrevSubmission=(req,res)=>{
	CodeOfIDE.findOneAndUpdate({email:req.body.email},{prevsubmission: req.body.prevsubmission}, function(err,id){
		if(err){
			res.json({
				status:500,
				message: err
			})
		}
		else
		{
			res.json({
				status:200,
				message: 'submission updated',
				data: id
			})
		}
	})
}
