function capitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

function isUpper(character) {
	return character == character.toUpperCase();
}

function toConstantStyle(camelized) {
	var constant = '';
	var lastCharIsUpper = true;
	for (var i = 0; i < camelized.length ; i++) {
		var character = camelized.charAt(i);
		var charIsUpper = isUpper(character);
		if (charIsUpper && !lastCharIsUpper) {
			constant += '_';
		}
		constant += character;
		lastCharIsUpper = charIsUpper;
	}
	return constant.toUpperCase();
}

exports.capitalize = capitalize;
exports.toConstantStyle = toConstantStyle;