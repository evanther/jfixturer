var argv = require('optimist')
	.usage('Creates a fixture at test scope. Usage: $0 path/to/File.java [-s suffix] [--p]')
	.describe('s', 'The resulting fixture class suffix')
    .describe('p', 'Use when the bean only has a parameterized constructor')
    .alias('s', 'suffix')
    .alias('p', 'param-constructor')
    .default('s', 'Fixture')
	.demand(1)
    .argv;
var fs = require('fs');
var file = require('file');
var Logger = require('./logger.js');
var JParser = require('./jparser.js');
var FixtureBuilder = require('./fixture/builder.js');


var logger = new Logger();

var paramConstructor = argv.p === true;
var suffix = argv.s;

// Read bean file
var inputFilepath = file.path.abspath(argv._[0]);
logger.info("Input file is: " + inputFilepath);
logger.info("Fixture suffix: " + suffix);

if (paramConstructor) {
	logger.warn("Indicated that the bean has parameterized constructor [-p]");
}

// Parse java class
var jParser = new JParser();
var parsed = jParser.parseFile(inputFilepath);

logger.info('Package detected: ' + parsed.package);
logger.info('Class detected: ' + parsed.clazz);
if (parsed.fields.length > 0) {
	logger.info('Fields detected: ');
	logger.info(parsed.fields);
} else {
	logger.error('No fields detected. Are you omitting the \'private\' modifier?\nAborted');
	process.exit(0);
}

// Build fixture code
var fixtureBuilder = new FixtureBuilder();
var fixtureClassName = parsed.clazz+suffix;
var fixtureCode = fixtureBuilder.build(parsed.package, parsed.clazz, fixtureClassName, parsed.fields, {paramConstructor : paramConstructor});

// Write fixture java file
var outputFolder = parsed.projectFolder+'/src/test/java/'+parsed.package.replace(/\./g, '/');
var outputFile = outputFolder+'/'+fixtureClassName+'.java';
if (fs.existsSync(outputFile)) {
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	fileExistsQuestion();
} else {
	doWrite();
}

function doWrite() {
	if (!fs.existsSync(outputFolder)) {
		logger.warn('Making output folder: '+outputFolder);
		file.mkdirsSync(outputFolder);
	}
	fs.writeFileSync(outputFile, fixtureCode);
	logger.ready('File was written: '+outputFile);
}

function fileExistsQuestion() {
	logger.warn('Output file exists: '+outputFile);
	logger.warn('Override? (y/n): ');
	process.stdin.once('data', function (chunk) {
		if (chunk && chunk.trim() == 'y') {
			doWrite();
			process.exit(0);
		} else if (chunk && chunk.trim() == 'n') {
			logger.info('Aborted');
			process.exit(0);
		} else {
			fileExistsQuestion();
		}
	});
}