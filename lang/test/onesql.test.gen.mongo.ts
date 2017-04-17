import * as OneSql from "../src/onesql";
import * as Semantic from "../src/onesql.semantic";
import * as Test from "./onesql.test";
import * as Mongo from "../src/onesql.gen.mongo";

export function whereMongo(): boolean {
	let sql: string = "USE foo;\n\n" +

					  "USE bar;\n\n" +

					  "USE onesqlTest;\n\n" +

					  "FROM demography\n" +
					  "WHERE TRUE;\n\n" +

					  "FROM demography\n" +
					  "WHERE NOT!TRUE;\n" +

					  "FROM demography\n" +
					  "WHERE state == 'CA' AND NOT (city = 'San Francisco');\n" +

					  "FROM demography\n" +
					  "WHERE city == 'Houston' OR NOT (population > 1000000) AND NOT (area > 600);\n" +

					  "FROM demography\n" +
					  "WHERE 'an' == substr(city, 1, floor(5 - 3));\n" +

					  "";

	let expectedBatch: Object = {
		statements: [
		{
			databaseName: "onesqlTest",
			collectionName: "demography",
			aggregationStages: [
			{
				$match: { $literal: true },
			}
		]},

		{
			collectionName: "demography",
			aggregationStages: [
			{
				$match: {
					$not: [{ $not: [{ $literal: true }] }]
				},
			}
		]},

		{
			collectionName: "demography",
			aggregationStages: [
			{
				$match: { 
					$and: [
						{ $eq: [ "$state", { $literal: "CA" } ] },
						{ $not: [{ $eq: [ "$city", { $literal: "San Francisco" } ] }] },
				]},
			}
		]},

		{
			collectionName: "demography",
			aggregationStages: [
			{
				$match: { 
					$and: [{
						$or: [
							{ $eq: [ "$city", { $literal: "Houston" } ] },
							{ $not: [{ $gt: [ "$population", { $literal: 1000000 } ] }] },
						]},
						{ $not: [{ $gt: [ "$area", { $literal: 600 } ] }] },
				]},
			}
		]},

		{
			collectionName: "demography",
			aggregationStages: [
			{
				$match: { 
					$eq: [
						{ $literal: "an" },
						{ $substrCP: [ "$city", { $literal: 1 }, { $floor: { $subtract: [ { $literal: 5 }, { $literal: 3 } ] } } ] },
				]},
			}
		]},

	]};

	let expectedJavascript: string = "\n" +
	"{\n" +
		"    let _db = db;\n" +
		"\n" +
		"    _db = db.getMongo().getDB('onesqlTest');\n" +
		"    _db.demography.aggregate(" + JSON.stringify((expectedBatch as Mongo.Batch).statements[0].aggregationStages, undefined, 2) + ");\n" +
		"\n" +
		"    _db.demography.aggregate(" + JSON.stringify((expectedBatch as Mongo.Batch).statements[1].aggregationStages, undefined, 2) + ");\n" +
		"\n" +
		"    _db.demography.aggregate(" + JSON.stringify((expectedBatch as Mongo.Batch).statements[2].aggregationStages, undefined, 2) + ");\n" +
		"\n" +
		"    _db.demography.aggregate(" + JSON.stringify((expectedBatch as Mongo.Batch).statements[3].aggregationStages, undefined, 2) + ");\n" +
		"\n" +
		"    _db.demography.aggregate(" + JSON.stringify((expectedBatch as Mongo.Batch).statements[4].aggregationStages, undefined, 2) + ");\n" +
	"}\n";

	let actualBatch: Mongo.Batch = OneSql.toMongo(sql);
	let actualJavascript: string = Mongo.genJavascriptBatch(actualBatch);

	let pass: boolean = true;
	pass = Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "mongo batch") && pass;
	pass = Test.areEqual(expectedJavascript, actualJavascript, Test.LogLevel.Info, "mongo javascript") && pass;
	return pass;
}