var argv = require('optimist')
	.usage('Usage: $0 --i=[filepath] --s=[optional suffix]')
    .demand(['i'])
    .argv;
var fs = require('fs');

var parsed = require('./freader.js');

var fixtureClassName = parsed.fixture;
var beanClassName = parsed.clazz;

var outputFile = parsed.outputFolder+'/'+fixtureClassName+'.java';
if (fs.existsSync(outputFile)) {
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	existsQuestion();
} else {
	doWork();
}

function existsQuestion() {
	console.log('Output file exists: ' + outputFile);
	console.log('Override? (y/n): ');
	process.stdin.once('data', function (chunk) {
		if (chunk && chunk.trim() == 'y') {
			doWork();
			process.exit(0);
		} else if (chunk && chunk.trim() == 'n') {
			console.log('Aborted');
			process.exit(0);
		} else {
			existsQuestion();
		}
	});
}

function capitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

function isUpper(character) {
	return character == character.toUpperCase();
}

function toConstantStyle(camelized) {
	var constant = '';
	for (var i = 0; i < camelized.length ; i++) {
		var character = camelized.charAt(i);
		if (isUpper(character)) {
			constant += '_';
		}
		constant += character;
	}
	return constant.toUpperCase();
}

function doWork() {
	var output = 'package '+parsed.package+';\n\n';

	output += 'public class '+fixtureClassName+' {\n\n';

	parsed.fields.forEach(function(field){
		output += '\tprivate static final ' + field.type + ' DEFAULT_' + toConstantStyle(field.name) + ' = /initial value/;\n';
	});
	output += '\n';

	output += '\tprivate '+beanClassName+' myBean;\n\n';

	output += '\tpublic static '+fixtureClassName+' New() {\n';
	output += '\t\treturn new '+fixtureClassName+'();\n';
	output += '\t}\n\n';

	output += '\tprivate '+fixtureClassName+'() {\n';
	output += '\t\tmyBean = new '+beanClassName+'();\n';
	parsed.fields.forEach(function(field){
		output += '\t\twith'+capitalize(field.name)+'(DEFAULT_'+toConstantStyle(field.name)+');\n';
	});
	output += '\t}\n\n';

	output += '\tpublic '+beanClassName+' build() {\n';
	output += '\t\treturn myBean;\n';
	output += '\t}\n\n';

	parsed.fields.forEach(function(field){
		output += '\tpublic '+fixtureClassName+' with'+capitalize(field.name)+'('+field.type+' '+field.name+') {\n';
		output += '\t\tmyBean.set'+capitalize(field.name)+'('+field.name+');\n';
		output += '\t\treturn this;\n';
		output += '\t}\n\n';
	});

	output += '}';

	if (!fs.existsSync(parsed.outputFolder)) {
		console.log('Making output folder: '+parsed.outputFolder);
		file.mkdirsSync(parsed.outputFolder);
	}

	fs.writeFileSync(outputFile, output);
	console.log('File was written: '+outputFile);
}