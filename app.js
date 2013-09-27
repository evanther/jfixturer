var argv = require('optimist')
	.usage('Usage: $0 --input=[filename] --fixture=[string] --bean=[string]')
    .demand(['fixture', 'bean'])
    .argv;

var fields = require('./freader.js');
var fs = require('fs');

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

var fixtureClassName = argv.fixture;
var beanClassName = argv.bean;

var output = 'public class '+fixtureClassName+' {\n\n';

fields.forEach(function(field){
	output += '\tprivate static final ' + field.type + ' DEFAULT_' + toConstantStyle(field.name) + ' = /initial value/;\n';
});
output += '\n';

output += '\tprivate '+beanClassName+' myBean;\n\n';

output += '\tpublic static '+fixtureClassName+' New() {\n';
output += '\t\treturn new '+fixtureClassName+'();\n';
output += '\t}\n\n';

output += '\tprivate '+fixtureClassName+'() {\n';
output += '\t\tmyBean = new '+beanClassName+'();\n';
fields.forEach(function(field){
	output += '\t\twith'+capitalize(field.name)+'(DEFAULT_'+toConstantStyle(field.name)+');\n';
});
output += '\t}\n\n';

output += '\tpublic '+beanClassName+' build() {\n';
output += '\t\treturn myBean;\n';
output += '\t}\n\n';

fields.forEach(function(field){
	output += '\tpublic '+fixtureClassName+' with'+capitalize(field.name)+'('+field.type+' '+field.name+') {\n';
	output += '\t\tmyBean.set'+capitalize(field.name)+'('+field.name+');\n';
	output += '\t\treturn this;\n';
	output += '\t}\n\n';
});

output += '}';

var outputFolder = './output';
if (!fs.existsSync(outputFolder)) {
	fs.mkdirSync(outputFolder);
}
var outputFile = outputFolder+'/'+fixtureClassName+'.java';

fs.writeFileSync(outputFile, output);
//console.log(output);
console.log('File was written: '+outputFile);