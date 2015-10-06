
var path = require('path');
var ejs = require(path.join(global.pathToApp, 'core/ejsWithHelpers.js'));

module.exports = function (source) {
	try {
		return ejs.render(source, {info: global.__currentSpecInfo__});
	} catch(e) {
		console.log('error prerendering webpack files', e);
		return source;
	}
};