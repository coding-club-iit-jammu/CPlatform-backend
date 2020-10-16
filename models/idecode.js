var mongoose = require('mongoose');
var ideschema = new mongoose.Schema({
	email:{
		type: String,
		required:true
	},
	cpp:{
		type: String,
		required:true,
		default:"#include <iostream> \n using namespace std; \n int main () { \n cout << \"hello world\"; \n return 0; \n }"
	},
	python:{
		type: String,
		required:true,
		default: "print('hello world')"
	},
	java:{
		type: String,
		required:true,
		default: "class Main { \n public static void main(String[] args) { \n System.out.println(\"hello world\"); \n } \n };"
	},
	prevsubmission:{
		type:String,
		required:true,
		default: "no submission"
	}
});

const CodeOfIDE = new mongoose.model("CodeOfIDE",ideschema);
module.exports = CodeOfIDE;