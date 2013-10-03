var ParametrizedBuilder = require('./parametrized.js');
var NonParametrizedBuilder = require('./nonparametrized.js');

/**
*	Class : FixtureBuilder
*/
function FixtureBuilder() {

	// private:
	var parametrizedBuilder;
	var nonParametrizedBuilder;

	// constructor:
	(function(){
		parametrizedBuilder = new ParametrizedBuilder();
		nonParametrizedBuilder = new NonParametrizedBuilder();
	})();

	// public:
	this.build = function(package, beanClassName, fixtureClassName, fields, options) {
		options = options || {};
		options.paramConstructor = options.paramConstructor != false;

		var builder = options.paramConstructor ? parametrizedBuilder : nonParametrizedBuilder;
		var code = builder.build(package, beanClassName, fixtureClassName, fields);
		return code;
	}
}

module.exports = FixtureBuilder;