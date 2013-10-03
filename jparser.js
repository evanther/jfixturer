var fs = require('fs');
var file = require('file');
var Logger = require('./logger.js');

PACKAGE_PATTERN = /^\s*package\s+(.+);$/;
CLASS_PATTERN = /.*\s+class\s+(\w+).*$/;
PRIVATE_FIELD_PATTERN = /^\s*private\s*([\w<>]+)\s*(\w+)\s*.*;\s*$/;
STATIC_FIELD_PATTERN = /.*static.*/;

DEFAULT_VALUES = {
	'String' : '\"some string\"',
	'int' : '123',
	'Integer' : '123',
	'Option<Integer>' : 'Option.some(123)',
	'long' : '123l',
	'Long' : '123l',
	'Option<Long>' : 'Option.some(123l)',
	'Date' : 'new Date(123)',
	'Option<Date>' : 'Option.some(new Date(123))',
	'boolean' : 'true',
	'Boolean' : 'Boolean.FALSE',
	'Option<Boolean>' : 'Option.some(Boolean.TRUE)'
};

// Class
function JParser() {

	// private:
	var logger;

	// constructor:
	(function(){
		logger = new Logger();
	})();

	// private:
	function readFile(filepath) {
		return fs.readFileSync(filepath, {encoding : 'utf8'});
	}

	// public:
	/**
	*	Method : parseFile
	*	Args
	*		filepath : Absolute or relative Java filepath
	*	Returns
	*		{
	*			package : string,
	*			clazz : string,
	*			fields : [{
	*				name : string,
	*				type : string,
	*				defaultVal : string
	*			}],
	*			srcFolder : string,
	*			projectFolder : string
	*		}
	*/
	this.parseFile = function(filepath) {
		var filepath = file.path.abspath(filepath);
		var fileContent = readFile(filepath);

		var parsed = {fields : []};

		fileContent.split('\n').forEach(function(line, index){
			line = line.trim();
			if (!parsed.package) {
				var matchesPackage = line.match(PACKAGE_PATTERN);
				if (matchesPackage) {
					parsed.package = matchesPackage[1];
				}
			}
			if (!parsed.clazz) {
				var matchesClass = line.match(CLASS_PATTERN);
				if (matchesClass) {
					parsed.clazz = matchesClass[1];
				}
			}
			var matchesPrivateField = line.match(PRIVATE_FIELD_PATTERN);
			if (matchesPrivateField && !line.match(STATIC_FIELD_PATTERN)) {
				var name = matchesPrivateField[2];
				var type = matchesPrivateField[1];
				var defaultVal = DEFAULT_VALUES[type];
				if (!defaultVal) {
					logger.warn('Unknown attribute type ' + type);
					defaultVal = '/*Unhandled type '+type+'. Please, add type mapping in jparser.js line 10 and push the code ;) thanks*/';
				}
				parsed.fields.push({type : type, name : name, defaultVal : defaultVal});
			}
		});

		var packageLevels = parsed.package.split('.');
		var inputFileLevels = filepath.split('/');
		if (inputFileLevels[0] == '') {
			inputFileLevels = inputFileLevels.slice(1);
		}

		var srcFolder = inputFileLevels.slice(0, inputFileLevels.length-packageLevels.length-1);
		var projectFolder = srcFolder.slice(0, srcFolder.length-3);

		parsed.srcFolder = '/'+srcFolder.join('/');
		parsed.projectFolder = '/'+projectFolder.join('/');

		return parsed;
	}

}

module.exports = JParser;