// https://www.npmjs.com/package/osmosis
var osmosis = require('osmosis');
const fs = require('fs');
const converter = require('json2csv');


const fields = ['name', 'url'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

// const asyncParser = new AsyncParser(opts, transformOpts);
// Grabbing query from command line for testing
var query = process.argv[2];
// Grabbing location from command line for testing
var location = process.argv[3];
var page = process.argv[4];
// URL for testing
var url = "https://www.yellowpages.com/search?search_terms=" + query + "&geo_location_terms=" + location + "&page=" + page;
osmosis.config('tries', 5);
osmosis.config('ignore_http_errors', 1);
osmosis.config('concurrency', 1);
// osmosis.config('proxy','http://50.246.4.13:54325');

function gimmeDat(url) {

	// Return promise to handle async
	return new Promise((resolve, reject) => {

		// Array to hold our listings
		let response = [];

		osmosis
			// load yellowpages
			.get(url)
			// Find all entries
			.paginate('div.pagination > ul > li > a.next', 50)
			.delay(240000)
			.find('div.info')
			// Create an object with Company and URL
			.set({
				name: 'h2 > a > span',
				url: 'div > div.links a.track-visit-website@href'
			})
			.follow('h2 > a@href')
			.error()
			.find('div.business-card-footer')
			.set({
				email: 'a.email-business@href'
			})
			.data(data => {
				// Push each entry into our 'response' array
				if (data.email) {
					response.push(data);
				}	
			})
			.log(console.log)
			.error(console.log)
			.done(() => resolve(response));
	});
}

function sort(data) {
	let csv = "";
	for (var i = 0; i < data.length; i++) {
		let line;
		let mail = data[i].email;
		let m = mail.substring(7)
		line = '"' + data[i].name + '"' + ', ' + '"' + data[i].url + '"' + ', ' + '"' + m + '"\n';
		csv += line;
	}
	console.log(csv);
}

gimmeDat(url).then(response => {

	var jsonstrMinifed = JSON.stringify(response);
	var jsonstr = JSON.stringify(response, null, 2);
	fs.writeFileSync('./output.json', jsonstr);

	var fields = ['name', 'url', 'email'];
	var parser = new converter.Parser({ fields });
	var csvstr = parser.parse(response);
	fs.writeFileSync('./output.csv', csvstr);
	// sort(response);
})
