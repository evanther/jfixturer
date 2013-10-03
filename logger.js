var colors = require('colors');

colors.setTheme({
  ready: 'green',
  warn: 'yellow',
  error: 'red'
});


// Class
function Logger() {

	// private:
	var enabled = true;

	// public:
	this.info = function(message) {
		if (enabled) {
			console.log(message);
		}
	};

	this.ready = function(message) {
		if (enabled) {
			console.log(message.ready);
		}
	};

	this.warn = function(message) {
		if (enabled) {
			console.log(message.warn);
		}
	};

	this.error = function(message) {
		if (enabled) {
			console.log(message.error);
		}
	};

	this.setEnabled = function(value) {
		enabled = value;
	};
}

module.exports = Logger;