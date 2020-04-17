var download = require('download-file')
let jsonData = require('./Assignment2.json');

var k = Object.keys(jsonData);

for(let x of k){
	var url = jsonData[x]["link"]
 
	var options = {
	    directory: `./Assignment2/${x.toUpperCase()}/`,
	    filename: x.toUpperCase()+'.zip'	
	}
	 
	download(url, options, function(err){
	    if (err) 
	    	throw err
	    console.log(x.toUpperCase()+'.zip')
	}) 
}