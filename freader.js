var argv = require('optimist').argv;
var fs = require('fs');
var file = require('file');

function capitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

var inputFile = file.path.abspath(argv.i);
var suffix = capitalize(argv.s || 'Fixture');

console.log('Input file is: ' + inputFile);
console.log('Using suffix: ' + suffix);

var fileData = fs.readFileSync(inputFile, {encoding : 'utf8'});

PACKAGE_PATTERN = /^\s*package\s+(.+);$/;
CLASS_PATTERN = /.*\s+class\s+(\w+).*$/;
PRIVATE_FIELD_PATTERN = /^\s*private\s*(\w+)\s*(\w+)\s*.*;\s*$/;
STATIC_FIELD_PATTERN = /.*static.*/;

var package;
var clazz;

var fields = [];
fileData.split('\n').forEach(function(line, index){
	line = line.trim();
	if (!package) {
		var matchesPackage = line.match(PACKAGE_PATTERN);
		if (matchesPackage) {
			package = matchesPackage[1];
		}
	}
	if (!clazz) {
		var matchesClass = line.match(CLASS_PATTERN);
		if (matchesClass) {
			clazz = matchesClass[1];
		}
	}
	var matchesPrivateField = line.match(PRIVATE_FIELD_PATTERN);
	if (matchesPrivateField && !line.match(STATIC_FIELD_PATTERN)) {
		fields.push({type : matchesPrivateField[1], name : matchesPrivateField[2]});
	}
});

console.log('Package detected: ' + package);
console.log('Class detected: ' + clazz);
console.log('Fields detected: ');
console.log(fields);

var packageLevels = package.split('.');

var iFileTokens = inputFile.split('/');
if (iFileTokens[0] == '') {
	iFileTokens = iFileTokens.slice(1);
}

var oFileTokens = iFileTokens.slice(0, iFileTokens.length-packageLevels.length-3);
oFileTokens.push('test', 'java');
oFileTokens = oFileTokens.concat(packageLevels);

var outputFolder = '';
oFileTokens.forEach(function(token){
	outputFolder += '/' + token;
});

module.exports = {fields : fields, clazz : clazz, fixture: clazz+suffix, package : package, outputFolder: outputFolder};