var WIDTH = 800, // width of the graph
	HEIGHT = 550, // height of the graph
	MARGINS = {top: 20, right: 20, bottom: 20, left: 60}, // margins around the graph
	xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]), // x range function
	yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]), // y range function
	rRange = d3.scale.linear().range([5, 20]), // radius range function - ensures the radius is between 5 and 20
	colors = [	// array of colors for the data points. Each ward will have a differnet colour
		"#981C30",
		"#989415",
		"#1E4559",
		"#7F7274",
		"#4C4A12",
		"#ffffff",
		"#4B0612",
		"#1EAAE4",
		"#AD5E71",
		"#000000",		
		"#00bfff",
		"#ffdab9",
		"#66cdaa",
		"#98fb98",
		"#ffd700",
		"#f4a460",
		"#ffa500",
		"#ff1493",
		"#556b2f",
		"#daa520",
		"#f0e68c",
		"#bc8f8f",
		"#ff6347",
		"#ee82ee",
		"#f0fff0",
		"#4682b4",
		"#bdb76b",
		"#ff4500",
		"#dda0dd",
		"#778899",
		"#b22222",
		"#a020f0",
		"#f5f5dc",
		"#32cd32",
		"#b0c4de",
		"#ff9933",
		"#ffff33",
		"#00ff00",
		"#0099cc",
		"#ff0033",
		"#ffcc00",
		"#cccccc",
		"#cc33cc",
		"#9999ff",
		"#996600",
		"#003300",
		"#330033",
		"#ccff66",
		"#ffccff",
		"#0000cc"
		
	],
	//currentDataset, // name of the current data set. Used to track when the dataset changes
	rawData, // the raw data from the CSV file
	drawingData, // data with the wards we don't want to display (dirty or it's "type" is unchecked)
	xAxis = d3.svg.axis().scale(xRange).tickSize(16).tickSubdivide(true), // x axis function
	yAxis = d3.svg.axis().scale(yRange).tickSize(10).orient("right").tickSubdivide(true), // y axis function
	vis; // visualisation selection

// runs once when the visualisation loads
function init () {
	vis = d3.select("#visualisation");

	// add in the x axis
	vis.append("svg:g") // container element
		.attr("class", "x axis") // so we can style it with CSS
		.attr("transform", "translate(0," + HEIGHT + ")") // move into position
		.call(xAxis); // add to the visualisation

	// add in the y axis
	vis.append("svg:g") // container element
		.attr("class", "y axis") // so we can style it with CSS
		.call(yAxis); // add to the visualisation

	// load data, process it and draw it
	update ();
}

// this redraws the graph based on the data in the drawingData variable
function redraw () {
	var citywards = vis.selectAll ("circle").data(drawingData, function (d) { return d.id;}), // select the data points and set their data
		axes = getAxes (); // object containing the axes we'd like to use (duration, inversions, etc.)

	// add new points if they're needed
	citywards.enter()
		.insert("svg:circle")
			.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
			.attr("cy", function (d) { return yRange (d[axes.yAxis]); })
			.style("opacity", 0)
			.style("fill", function (d) { return colors[d.ward.id]; }); // set fill colour from the colors array

	// the data domains or desired axes might have changed, so update them all
	xRange.domain([
		d3.min(drawingData, function (d) { return +d[axes.xAxis]; }),
		d3.max(drawingData, function (d) { return +d[axes.xAxis]; })
	]);
	yRange.domain([
		d3.min(drawingData, function (d) { return +d[axes.yAxis]; }),
		d3.max(drawingData, function (d) { return +d[axes.yAxis]; })
	]);
	rRange.domain([
		d3.min(drawingData, function (d) { return +d[axes.radiusAxis]; }),
		d3.max(drawingData, function (d) { return +d[axes.radiusAxis]; })
	]);

	// transition function for the axes
    var t = vis.transition().duration(1500).ease("exp-in-out");
    t.select(".x.axis").call(xAxis);
    t.select(".y.axis").call(yAxis);

	// transition the points
	citywards.transition().duration(1500).ease("exp-in-out")
		.style("opacity", 1)
		.style("fill", function (d) { return colors[d.ward.id]; }) // set fill colour from the colors array
		.attr("r", function(d) { return rRange (d[axes.radiusAxis]); })
		.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
		.attr("cy", function (d) { return yRange (d[axes.yAxis]); });

	// remove points if we don't need them anymore
	citywards.exit()
		.transition().duration(1500).ease("exp-in-out")
		.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
		.attr("cy", function (d) { return yRange (d[axes.yAxis]); })
			.style("opacity", 0)
			.attr("r", 0)
				.remove();
}

// let's kick it all off!
init ();




//////////////////////////////////////////////////////////
// helper functions - health warning! LOTS of javascript!
//////////////////////////////////////////////////////////

// update the list of checkboxes which allows the selection of ward types
function generateWardsList (data) {
	var i = data.length,
		wardNames = {},
		select = document.getElementById("ward-types"),
		list = "";

	// loop though each ward and check it's type's name. If we haven't seen
	// it before, add it to an object so that we can use it to build the list
	while (i--) {
		if (typeof wardNames[data[i].ward.name] == "undefined") {
			wardNames[data[i].ward.name] = data[i].ward.className;
		}
	}
	// loop through the array to generate the list of types
	for (var key in wardNames) {
		if (wardNames.hasOwnProperty(key)) {
			list = '<li class="' + wardNames[key] + '"><label><input type="checkbox" checked="checked" value="' + slugify(key) + '">' + key + '</label></li>' + list;
		}
	}
	// update the form
	select.innerHTML = list;
}

// take a string and turn it into a WordPress style slug
function slugify (string) {
	return string.replace (/([^a-z0-9])/ig, '-').toLowerCase ();
}

// return an object containing the currently selected axis choices
function getAxes () {
	var x = document.querySelector("#x-axis input:checked").value,
		y = document.querySelector("#y-axis input:checked").value,
		r = document.querySelector("#r-axis input:checked").value;
	return {
		xAxis: x,
		yAxis: y,
		radiusAxis: r
	};
}

// after analysis, dirty data is considered to be that which can't be converted
// to a number, or where the number is 0 (meaning it is unknown)
function isDirty (data) {
	var clean = "ward crimes year".split(" ").every (function (attribute) {
		return !isNaN (+data[attribute]) && +data[attribute] > 0;
	});
	return !clean;
}

// return a list of types which are currently selected
function plottableWards () {
	var wards = [].map.call (document.querySelectorAll ("#ward-types input:checked"), function (checkbox) { return checkbox.value;} );
	return wards;
}

// take a raw dataset and remove wards which shouldn't be displayed
// (i.e. if it is "dirty" or it's type isn't selected)
function processData (data) {
	var processed = [],
		cullDirty = document.getElementById("cull-dirty").checked,
		wardTypes = {},
		counter = 1;

	data.forEach (function (data, index) {
		var w,
			className = "";
		//if (!(cullDirty && isDirty(data))) { // don't process it if it's dirty and we want to cull dirty data
				w = {
					id: index // so that the wards can animate
				};
			for (var attribute in data) {
				if (data.hasOwnProperty (attribute)) {
					w[attribute] = data[attribute]; // populate the ward object
				}
			}
			if (typeof wardTypes[data.ward] == "undefined") { // generate a classname for the ward based on it's type (used for styling)
				wardTypes[data.ward] = {
					id: counter - 1,
					className: 'wardtype-' + counter,
					name: data.ward,
					slug: slugify(data.ward)
				};
				counter = counter + 1;
			}
			w.ward = wardTypes[data.ward];
			processed.push (w); // add the ward to the output
		//}
	});

	return processed; // only contains wards we're interested in visualising
}

// remove wards whose type is not selected from a dataset
function cullUnwantedTypes (wards) {
	var typesToDisplay = plottableWards ();

	return wards.filter (function (w) {
		return typesToDisplay.indexOf(w.ward.name) !== -1;
	});
}

// called every time a form field has changed
function update () {
	var processedData; // the data while will be visualised
	
	d3.csv("chicago.csv", function(data){
		rawData = data;
		processedData = processData(rawData);
		generateWardsList(processedData);
		drawingData = cullUnwantedTypes(processedData);
		redraw();
	})
}

// listen to the form fields changing
document.getElementById("cull-dirty").addEventListener ("change", update, false);
document.getElementById("dataset").addEventListener ("change", update, false);
document.getElementById("controls").addEventListener ("click", update, false);
document.getElementById("controls").addEventListener ("keyup", update, false);
