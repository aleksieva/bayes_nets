var doSampling = function(node, parents, sample){
	var randVal = Math.random();
	// console.log(randVal);
	//get the cpt of the node
	var cpt = node.tbl;
	//get the probability distribution
	var probabValues = [];

	if(parents.length > 0) {
		//node that has parents
		for (var p in parents) {
			// get parents id + parents sampled value
			var sampledVal = parents[p] + sample[parents[p]]
			//get the next level in the cpt
			cpt = cpt[sampledVal];
		}
	}

	//reached the deepest level in the cpt
	//go through the possible values and get the corresponding probabilities
	//go through the probability ranges for each possible value 
	//and check if the random number is in one of this ranges
	//return the value associated with this range 
	var sum = 0.0;
	for(var val in cpt) {
		var currProb = parseFloat(cpt[val]);
		var lowerBound = sum;
		sum+= currProb;
		var upperBound = sum;
		if (lowerBound <= randVal && randVal < upperBound) {
			return val.replace(node.id.toString(), "");
		}
	}	
}

var sampleNode = function(node, sample) {
	var parents = getNodeParents(node);
	// console.log("Parents " + parents);
	if(parents.length > 0) {
		parents.forEach(function(p) {
			var currParent = nodes.filter(function(n) { return n.id === p})[0];
			if(currParent.sampled === false) {
				sampleNode(currParent, sample);
			}
			else if(!currParent.sampled){
				console.log("currParent is undefined");
			}
		})	
	}
	var value = doSampling(node, parents, sample);
	// console.log(value);
	var nodeId = node.id;
	sample[nodeId] = value;
	node.sampled = true;
}

var setSamplingStatus = function(fixed) {
	//set all nodes state to not sampled
	for (var n in nodes) {
		nodes[n].sampled = false;
	}
	// console.log(fixed);
	for(var id in fixed) {
		var fixedNode = nodes.filter(function(node){
			return node.id === parseInt(id);
		})[0];
		fixedNode.sampled = true;
		// nodes[id].sampled = true;
	}
	return true;
}

var singleSample = function(fixed) {
	var currSample = {};
	//fix any values if any have been chosen
	for (var id in fixed) {
		if(fixed[id] !== "none") {
			currSample[id] = fixed[id];
		}
	}
	// console.log(currSample);

	//set nodes status to not sampled if not fixed
	setSamplingStatus(currSample);

	//sample each node that has not been sampled
	nodes.forEach(function(n) {
		if(!n.sampled) {
			sampleNode(n, currSample);
		}
	})

	return currSample;
}

var resample = function(numSamples, fSample) {
	var samples = [];
	for (var i=0; i< numSamples; i++) {
		// console.log(fSample);
		var sample = singleSample(fSample);
		samples.push(sample);
	}

	//get nodes status back to false
	setSamplingStatus();
	//display the samples
	displaySamples(samples, numSamples, fSample);
}

var sampleTblColumnNames = function(){
	var names = [];
	var columns = ""

	for(var n in nodes) {
		names.push(nodes[n].title);
	}

	for (var name in names) {
		columns += '<th>' + names[name] + '</th>';
	}

	d3.select(".sample-tbl")
	  .append("thead")
	  .append("tr")
	  .html(columns);
}

var formatSamplesDownload = function(samples) {
	var sampleArray = [];

	//first row is the titles
	var titles = [];
	nodes.forEach(function(node) {
		titles.push(node.title);
	})
	sampleArray.push(titles);

	//the actual samples
	samples.forEach(function(sample) {
		var newRow = [];
		for (var val in sample) {
			// console.log(sample[val]);
			newRow.push(sample[val]);
		}
		sampleArray.push(newRow);
	})

	//example used from http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
	var csvData = "";
	sampleArray.forEach(function(singleRow, index){
		var currRow = singleRow.join(",");
		csvData += index < sampleArray.length ? currRow + '\n' : currRow;
	})

	return csvData;
}

var downloadSamples = function(filename, samples) {
	//format the data to be downloaded
	var sampleData = formatSamplesDownload(samples);

	var blob = new Blob([sampleData], {type:"text/csv;charset=utf-8"});

	//on empty input - give an alert message
	if (!isEmptyString(filename)) {
		filename = filename + ".csv";
		saveAs(blob, filename);	
	}
	else {
		bootbox.dialog({
		  message: "Specify a name for the file.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});		
	}
}

var displaySamples = function(samples, noSample, fSample) {
	//clear the display space
	clearDisplayField();

	var btnGroup = control.append("div")
		   				  .attr("class", "btn-group")
						  .attr("role", "group");
	//sample again btn 	   
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .attr("id", "resample")
		   .html("Resample")
		   .on("click", function(){
		   	resample(noSample, fSample);
		   });

	//download button
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .attr("id", "sampleDownloadBtn")
		   .html("Download")
		   .on("click", function() {
		   	specifyDownloadName(2, ".csv", samples);
		   	// downloadSamples(samples);
		   });
	//reset btn
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .attr("id", "reset")
		   .html("Reset")
		   .on("click", function(){
		   	samplingSettings();
		   });			   

	control.append("hr");

	//display the first 20 samples only
	//if more than that -> warn the users to download the rest
	if(noSample > 20) {
		//warning message
		var warningDiv = control.append("div")
								.attr("class", "alert-text alert alert-warning")
		warningDiv.append("span")
				  .attr("class", "glyphicon glyphicon-info-sign")
				  .attr("aria-hidden", "true");
		warningDiv.append("span")
				  .attr("class", "sr-only")
				  .text("Warning");
		var text = warningDiv.html() + " Only the first 20 samples will be displayed. If you wish to view all the samples, download them by clicking the \'Download\' button."				  		  
		warningDiv.html(text);
	}

	// append table for the results
	var sampleTbl;
	sampleTbl = control.append("div")
						   .attr("class", "table-responsive sample-table")
						   .append("table")
	  	   				   .attr("class", "table table-bayes sample-tbl");


	//append the columns names
	sampleTblColumnNames();

	var sampleTblBody = sampleTbl.append("tbody");
	var accumulator = "";
	for (var s in samples.slice(0,20)) {
		for (var val in samples[s]) {
			accumulator += '<td>' + samples[s][val] + '</td>';
		}
		sampleTblBody.append("tr").html(accumulator);
		accumulator = "";
	}
}

var checkExistingCpts = function() {
	//check for all nodes that their cpt have been initialised
	var titles = [];
	for (var n in nodes) {
		if (!nodes[n].tbl)
			titles.push(nodes[n].title);
	}
	if(titles.length !== 0) {
		// alert("Nodes \"" + titles + "\" need their CPTs initialised.");
		bootbox.dialog({
		  message: "Nodes \"" + titles + "\" need their CPTs initialised.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});			
		return false;
	}
	return true; 
}

// calculate in advance the time needed for 100 samples to inform the user
var estimatedSampling = function() {
	var estimatedSamples = 100;
	var start = new Date().getTime();
	// console.log(start);
	for(var i=0; i<estimatedSamples; i++) {
		singleSample();
	}
	var stop = new Date().getTime();
	// console.log(stop);
	var time = (stop - start)/1000;
	// console.log(time);

	//info message
	var infoDiv = control.append("div")
						.attr("class", "alert-text alert alert-info")
	infoDiv.append("span")
			  .attr("class", "glyphicon glyphicon-cog")
			  .attr("aria-hidden", "true");
	infoDiv.append("span")
			  .attr("class", "sr-only")
			  .text("Info");
	var text = infoDiv.html() + " Estimated time for sampling 100 samples is " + time + " seconds.";				  		  
	infoDiv.html(text);	
}

var ancestralSampling = function(fSample) {
	//remove previous error messages
	d3.selectAll(".alert-text").remove();

	//get the number of samples to be made
	var noOfSamples = parseInt(d3.select("#num-samples-input").node().value);
	if(isNaN(noOfSamples) || noOfSamples <= 0) {
		//error message
		var errorDiv = control.insert("div", "#num-samples-input")
							   .attr("class", "alert-text alert alert-danger");
		errorDiv.append("span")
				.attr("class", "glyphicon glyphicon-exclamation-sign")
				.attr("aria-hidden", "true");
		errorDiv.append("span")
				.attr("class", "sr-only")
				.text("Error");
		var text = errorDiv.html() + " Enter a positive integer for a number of samples.";
		errorDiv.html(text);			
		return;
	}

	var success = checkExistingCpts();
	if (!success) {
		return;
	}

	console.time("mytimer");
	var samples = [];
	for (var i=0; i< noOfSamples; i++) {
		// console.log(fSample);
		var sample = singleSample(fSample);
		samples.push(sample);
	}
	console.timeEnd("mytimer");

	//get nodes status back to false
	setSamplingStatus();
	//display the samples
	displaySamples(samples, noOfSamples, fSample);
}

var samplingSettings = function(){
	// clear the display field
	clearDisplayField();
	// deselect if there is a selected node
	selectedNode = null;
	refresh();	

	//keep the fixed values here
	var fixedSamples = {};
	nodes.forEach(function(node){
		fixedSamples[node.id] = "none";
	})

	// estimated time for sampling
	estimatedSampling();

	//number of samples
	control.append("label")
		.attr("for", "num-samples-input")
		.attr("class", "label-text")
		.text("Choose number of samples:")
	control.append("input")
	  	   .attr("id", "num-samples-input")
		   .attr("type", "number")
		   .attr("min", "1");
	control.append("button")
		   .attr("class", "btn btn-default btn-bayes-short margin-btn")
		   .attr("id", "runSamplingBtn")
		   .html("Run")
		   .on("click", function(){
				ancestralSampling(fixedSamples);
		   });

	//fixed ancestral sampling
	control.append("hr");
	control.append("label")
		   .attr("for", "fixed-sampling-div")
		   .attr("class", "label-text")
		   .text("Fix the values of any of the nodes:");
	var fixedTbl = control.append("div")
		   .attr("class", "table-responsive sample-table")
		   .attr("id", "fixed-sampling-div")
		   .append("table")
		   .attr("class", "table table-bayes");
	nodes.forEach(function(node) {
		var row = fixedTbl.append("tr");

		//append node titles
		row.append("td").text(node.title);
		//append selects with values
		var select = row.append("td")
							 .append("select")
							 .attr("id", node.id)
							 .attr("class", "form-control")
							 .on("change", function(){
							 	fixedSamples[this.id] = this.options[this.selectedIndex].value;
							 	// console.log(fixedSamples);
							 });

		//default option
		select.append("option")
			  .attr("value", "none")
			  .attr("selected", true)
			  .text("Not fixed")//?
		//all possible values for this node	  
		node.values.forEach(function(value) {
			select.append("option")
			      .attr("value", value)
			      .text(value);
		});
	})
}