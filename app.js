var argv = require('optimist')
	.usage('Creates a fixture at test scope. Usage: $0 path/to/File.java [-s suffix] [--pc]')
	.demand(1)
    .default('s', 'Fixture')
    .alias('s', 'suffix')
    .describe('s', 'The fixture class suffix')
    .describe('pc', 'Use when the bean only has a parameterized constructor')
    .argv;

var fs = require('fs');
var file = require('file');

var colors = require('colors');

colors.setTheme({
  ok: 'green',
  warn: 'yellow',
  error: 'red'
});

var hasParametrizedConstructor = argv.pc;
if (hasParametrizedConstructor) {
	console.log("Was indicated that the bean only has a parameterized constructor. Switching the strategy...".warn);
}

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
	console.log(('Output file exists: ' + outputFile).warn);
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
		output += '\tprivate static final ' + field.type + ' DEFAULT_' + toConstantStyle(field.name) + ' = '+field.defaultVal+';\n';
	});
	output += '\n';

	if (hasParametrizedConstructor) {
		parsed.fields.forEach(function(field){
			output += '\tprivate ' + field.type + ' ' + field.name + ';\n';
		});
		output += '\n';

		output += '\tpublic static '+fixtureClassName+' New() {\n';
		output += '\t\treturn new '+fixtureClassName+'();\n';
		output += '\t}\n\n';

		output += '\tprivate '+fixtureClassName+'() {\n';
		parsed.fields.forEach(function(field){
			output += '\t\t'+field.name+' = DEFAULT_'+toConstantStyle(field.name)+';\n';
		});
		output += '\t}\n\n';

		output += '\tpublic '+beanClassName+' build() {\n';
		output += '\t\t'+beanClassName+' myBean = new '+beanClassName+'(...);\n';
		parsed.fields.forEach(function(field){
			output += '\t\tmyBean.set'+capitalize(field.name)+'('+field.name+'); // delete if not used\n';
		});
		output += '\t\treturn myBean;\n';
		output += '\t}\n\n';

		parsed.fields.forEach(function(field){
			output += '\tpublic '+fixtureClassName+' with'+capitalize(field.name)+'('+field.type+' '+field.name+') {\n';
			output += '\t\tthis.'+field.name+' = '+field.name+';\n';
			output += '\t\treturn this;\n';
			output += '\t}\n\n';
		});

		output += '}';
	} else {
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
	}

	if (!fs.existsSync(parsed.outputFolder)) {
		console.log('Making output folder: '+parsed.outputFolder);
		file.mkdirsSync(parsed.outputFolder);
	}

	fs.writeFileSync(outputFile, output);
	console.log(('File was written: '+outputFile).ok);
}