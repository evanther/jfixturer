var argv = require('optimist').argv;
var fs = require('fs');

var inputFile = argv.i || 'input';

var fileData = fs.readFileSync(inputFile, {encoding : 'utf8'});

// PRIVATE_FIELD_PATTERN = /^\s*private\s*(\w+)\s*(\w+)\s*[^(]*;\s*$/;
	
var fields = [];
fileData.split('\n').forEach(function(line, index){
	line = line.trim();
	var lineParts = line.split(/\s+/);
	console.log('Processing [' + lineParts + ']');
	if (lineParts.length != 2) {
		throw 'Invalid input line ' + (index+1) + ' = ' + line;
	}
	fields.push({type : lineParts[0], name : lineParts[1]});
});

module.exports = fields;