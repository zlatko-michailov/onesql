
// Drop any leftovers
{
	let oldDB = db.getMongo().getDB('onesqlTest');
	oldDB.dropDatabase();
}

// Recreate the db
{
	let newDB = db.getMongo().getDB('onesqlTest');
	newDB.createCollection("demography");
	newDB.demography.insertMany([
		{ city: "New York",      state: "NY", population: 8555405, area: 302.6 },
		{ city: "Los Angeles",   state: "CA", population: 3971883, area: 467.8 },
		{ city: "Chicago",       state: "IL", population: 2720546, area: 227.6 },
		{ city: "Houston",       state: "TX", population: 2296224, area: 599.6 },
		{ city: "Philadelphia",  state: "PA", population: 1567442, area: 134.1 },
		{ city: "Phoenix",       state: "AZ", population: 1563025, area: 516.7 },
		{ city: "San Antonio",   state: "TX", population: 1469845, area: 460.9 },
		{ city: "San Diego",     state: "CA", population: 1394928, area: 325.2 },
		{ city: "Dallas",        state: "TX", population: 1300092, area: 340.5 },
		{ city: "San Jose",      state: "CA", population: 1026908, area: 176.6 },
		{ city: "Austin",        state: "TX", population:  931830, area: 322.5 },
		{ city: "Jacksonville",  state: "FL", population:  868031, area: 747.0 },
		{ city: "San Francisco", state: "CA", population:  864816, area:  46.9 }
	]);
}