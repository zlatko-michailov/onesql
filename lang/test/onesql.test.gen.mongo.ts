import * as OneSql from "../src/onesql";
import * as Semantic from "../src/onesql.semantic";
import * as Test from "./onesql.test";
import * as Mongo from "../src/onesql.gen.mongo";

export function whereBasicMongo(): boolean {
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

	]};

	let actualBatch: Mongo.Batch = OneSql.toMongo(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}