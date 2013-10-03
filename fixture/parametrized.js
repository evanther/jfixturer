var util = require('../util.js');

/**
*	Class : ParametrizedBuilder
*/
function ParametrizedBuilder() {

	// public:
	this.build = function(package, beanClassName, fixtureClassName, fields) {
		var code = 'package '+package+';\n\n';

		code += 'public class '+fixtureClassName+' {\n\n';

		fields.forEach(function(field){
			code += '\tprivate static final ' + field.type + ' DEFAULT_' + util.toConstantStyle(field.name) + ' = '+field.defaultVal+';\n';
		});
		code += '\n';

		fields.forEach(function(field){
			code += '\tprivate ' + field.type + ' ' + field.name + ';\n';
		});
		code += '\n';

		code += '\tpublic static '+fixtureClassName+' New() {\n';
		code += '\t\treturn new '+fixtureClassName+'();\n';
		code += '\t}\n\n';

		code += '\tprivate '+fixtureClassName+'() {\n';
		fields.forEach(function(field){
			code += '\t\t'+field.name+' = DEFAULT_'+util.toConstantStyle(field.name)+';\n';
		});
		code += '\t}\n\n';

		code += '\tpublic '+beanClassName+' build() {\n';
		code += '\t\t'+beanClassName+' myBean = new '+beanClassName+'(...);\n';
		fields.forEach(function(field){
			code += '\t\tmyBean.set'+util.capitalize(field.name)+'('+field.name+'); // delete if not used\n';
		});
		code += '\t\treturn myBean;\n';
		code += '\t}\n\n';

		fields.forEach(function(field){
			code += '\tpublic '+fixtureClassName+' with'+util.capitalize(field.name)+'('+field.type+' '+field.name+') {\n';
			code += '\t\tthis.'+field.name+' = '+field.name+';\n';
			code += '\t\treturn this;\n';
			code += '\t}\n\n';
		});

		code += '}';
		return code;
	}
}

module.exports = ParametrizedBuilder;