// To see the changes from this file, run this command:
//     browserify ui/onesql.ui.src.js -o ui/onesql.ui.out.js

var onesql = require("../out/lang/src/onesql");

window.ui = {
	translate: function() {
		var sql = ui.sqlEditor.getValue();
		try {
			var semantic = onesql.sqlToSemantic(sql);
			ui.json1Editor.setValue(JSON.stringify(semantic, undefined, 2));

			var mongoJavascript = onesql.semanticToMongoJavascript(semantic);
			ui.json2Editor.setValue(mongoJavascript);
		}
		catch (ex) {
			console.log(ex);
		}
	}
};

console.log("ui script loaded.");