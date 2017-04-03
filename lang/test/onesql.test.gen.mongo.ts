import * as OneSql from "../src/onesql";
import * as Semantic from "../src/onesql.semantic";
import * as Test from "./onesql.test";
import * as Mongo from "../src/onesql.gen.mongo";

export function whereBasicMongo(): boolean {
	let sql: string = "USE foo;\n\n" +

					  "USE bar;\n\n" +

					  "USE test;\n\n" +

					  "FROM Demography\n" +
					  "WHERE TRUE;\n\n" +

					  "FROM Demography\n" +
					  "WHERE NOT!TRUE;\n" +

					  "FROM Demography\n" +
					  "WHERE State == 'CA' AND NOT City = 'San Francisco';\n" +

					  "FROM Demography\n" +
					  "WHERE City == 'Houston' OR NOT Popukation > 1000000 AND NOT Area > 600;\n" +

					  "";

	let expectedBatch: Object = {
		statements: [
		{
			databaseName: "test",
			collectionName: "Demography",
			aggregationStages: [
			{
				$match: true,
			}
		]},

		{
			collectionName: "Demography",
			aggregationStages: [
			{
				$match: true,
			}
		]},

		{
			collectionName: "Demography",
			aggregationStages: [
			{
				$match: true,
			}
		]},

		{
			collectionName: "Demography",
			aggregationStages: [
			{
				$match: true,
			}
		]},

	]};

	let actualBatch: Mongo.Batch = OneSql.toMongo(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}