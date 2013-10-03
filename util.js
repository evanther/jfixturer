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

exports.capitalize = capitalize;
exports.toConstantStyle = toConstantStyle;