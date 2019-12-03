// https://www.npmjs.com/package/osmosis
var osmosis = require('osmosis');
// Grabbing query from command line for testing
var query = process.argv[2];
// Grabbing location from command line for testing
var location = process.argv[3];
// URL for testing
var url = "https://www.yellowpages.com/search?search_terms=" + query + "&geo_location_terms=" + location;

function gimmeDat(url) {

	// Return promise to handle async
	return new Promise((resolve, reject) => {

		// Array to hold our listings
		let response = [];

		osmosis
			// load yellowpages
			.get(url)
			// Find all entries
			.paginate('div.pagination > ul > li > a.next')
			.delay(2000)
			.find('div.info')
			// Create an object with Company and URL
			.set({
				name: 'h2 > a > span',
				url: 'div > div.links a.track-visit-website@href'
			})
			.data(data => {
				// Push each entry into our 'response' array
				if (data.url) {
					response.push(data);
				}	
			})
			.error(err => reject(err))
			.done(() => resolve(response));
	});
}

gimmeDat(url).then(response => {

	console.log(response);
})