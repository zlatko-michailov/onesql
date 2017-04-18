// To see the changes from this file, run this command:
//     browserify ui/onesql.ui.src.js -o ui/onesql.ui.out.js

var onesql = require("../out/lang/src/onesql");

window.onesqlui = {
	load: function(ev) {
		onesqlui.createEditors();

		onesqlui.makeButton("translate", onesqlui.translate, undefined);
		onesqlui.makeButton("copy-sql", onesqlui.copy, "sqlEditor");
		onesqlui.makeButton("help", onesqlui.help, undefined);

		onesqlui.makeButton("copy-semantic", onesqlui.copy, "semanticEditor");

		onesqlui.makeButton("copy-mongo", onesqlui.copy, "mongoEditor");
	},

	translate: function(ev) {
		var sql = onesqlui.sqlEditor.getValue();
		try {
			var semantic = onesql.sqlToSemantic(sql);
			onesqlui.semanticEditor.setValue(JSON.stringify(semantic, undefined, 2));

			var mongoJavascript = onesql.semanticToMongoJavascript(semantic);
			onesqlui.mongoEditor.setValue(mongoJavascript);
		}
		catch (ex) {
			onesqlui.mongoEditor.setValue(JSON.stringify(ex, undefined, 2));
		}
	},

	copy: function(ev) {
		var editorName = ev.target.getAttribute("editor-name");
		var editor = onesqlui[editorName];

		var temp = document.createElement("textarea");
		temp.value = editor.getValue();
		temp.style.width = 1;
		temp.style.height = 1;
		temp.style.border = "none";
		document.body.appendChild(temp);
		temp.select();

		try {
			document.execCommand("copy");
		}
		finally {
			document.body.removeChild(temp);
			ev.target.style.padding = "2px 4px 2px 4px";
		}
	},

	help: function(ev) {
		// TODO:
	},

	makeButton: function(id, click, editorName) {
		var button = document.getElementById(id);
	
		button.setAttribute("class", "button");
		button.setAttribute("href", "");
		if (editorName) {
			button.setAttribute("editor-name", editorName);
		}
		
		button.addEventListener("mouseover", onesqlui.mouseover);
		button.addEventListener("mouseout", onesqlui.mouseout);
		button.addEventListener("click", function(ev) {
			ev.preventDefault();

			ev.target.style.backgroundColor = "#d8d8d8";
			ev.target.style.color = "red";

			try {
				click(ev);
			}
			finally {
				setTimeout(function() {
					ev.target.style.backgroundColor = "white";
					ev.target.style.color = "blue";
				}, 100);
			}
		});
	},

	mouseover: function(ev) {
		ev.target.style.borderWidth = "2px";
		ev.target.style.padding = "2px 4px 2px 4px";
		ev.target.style.color = "blue";
		ev.target.style.borderColor = "black";
	},

	mouseout: function(ev) {
		ev.target.removeAttribute("style");
	},

	createEditors: function() {
		onesqlui.sqlEditor = CodeMirror.fromTextArea(document.getElementById('mark-sql'), {
			mode: 'text/x-sql',
			indentWithTabs: false,
			smartIndent: true,
			lineNumbers: true,
			lineWrapping: true,
			matchBrackets : true,
			autofocus: true,
			extraKeys: { "Ctrl-Space": "autocomplete" },
			hintOptions: { tables: {
				users: { name: null, score: null, birthDate: null },
				countries: { name: null, population: null, size: null }
			}}
		});

		onesqlui.semanticEditor = CodeMirror.fromTextArea(document.getElementById('mark-semantic'), {
			mode: 'application/json',
			indentWithTabs: false,
			smartIndent: true,
			lineNumbers: true,
			lineWrapping: true,
			matchBrackets : true,
			autofocus: true,
			readOnly: "nocursor"
		});

		onesqlui.mongoEditor = CodeMirror.fromTextArea(document.getElementById('mark-mongo'), {
			mode: 'application/json',
			indentWithTabs: false,
			smartIndent: true,
			lineNumbers: true,
			lineWrapping: true,
			matchBrackets : true,
			autofocus: true,
			readOnly: "nocursor"
		});

		let sqlEditorElement = document.getElementById('mark-sql').nextSibling;
		let semanticEditorElement = document.getElementById('mark-semantic').nextSibling;
		let mongoEditorElement = document.getElementById('mark-mongo').nextSibling;

		let height = (window.innerHeight - 120) + "px";
		sqlEditorElement.style.height = height;
		semanticEditorElement.style.height = height;
		mongoEditorElement.style.height = height;

		semanticEditorElement.style.backgroundColor = "#f4f4f4";
		mongoEditorElement.style.backgroundColor = "#f4f4f4";
	},
};

window.onload = onesqlui.load;