var util = require('../util.js');

/**
*	Class : NonParametrizedBuilder
*/
function NonParametrizedBuilder() {

	// public:
	this.build = function(package, beanClassName, fixtureClassName, fields) {
		var code = 'package '+package+';\n\n';

		code += 'public class '+fixtureClassName+' {\n\n';

		fields.forEach(function(field){
			code += '\tprivate static final ' + field.type + ' DEFAULT_' + util.toConstantStyle(field.name) + ' = '+field.defaultVal+';\n';
		});
		code += '\n';

		code += '\tprivate '+beanClassName+' myBean;\n\n';

		code += '\tpublic static '+fixtureClassName+' New() {\n';
		code += '\t\treturn new '+fixtureClassName+'();\n';
		code += '\t}\n\n';

		code += '\tprivate '+fixtureClassName+'() {\n';
		code += '\t\tmyBean = new '+beanClassName+'();\n';
		fields.forEach(function(field){
			code += '\t\twith'+util.capitalize(field.name)+'(DEFAULT_'+util.toConstantStyle(field.name)+');\n';
		});
		code += '\t}\n\n';

		code += '\tpublic '+beanClassName+' build() {\n';
		code += '\t\treturn myBean;\n';
		code += '\t}\n\n';

		fields.forEach(function(field){
			code += '\tpublic '+fixtureClassName+' with'+util.capitalize(field.name)+'('+field.type+' '+field.name+') {\n';
			code += '\t\tmyBean.set'+util.capitalize(field.name)+'('+field.name+');\n';
			code += '\t\treturn this;\n';
			code += '\t}\n\n';
		});

		code += '}';
		return code;
	}
}

module.exports = NonParametrizedBuilder;