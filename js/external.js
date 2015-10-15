//parts of the code are taken from http://stackoverflow.com/questions/19684318/how-to-customize-bootbox-js-prompt-options
//depending on the mode - different download
// mode 1 -> downloadNetwork
// mode 2 -> downloadSamples
// mode 3 -> downloadPNG
var specifyDownloadName = function(mode, ext, samples) {
	var filename = "";
	bootbox.dialog({
	  message: "<input type='text' id='filename' class='alert-input'></input> " + ext,
	  title: "Specify file name:",
	  value: "bayesnet",
	  buttons: {
	    main: {
	      label: "Download",
	      className: "btn-primary btn-bayes",
	      callback: function() {
	        filename = $('#filename').val();
	        if(mode === 1) {
		        downloadNetwork(filename);	
	        }
	        else if(mode === 2) {
	        	downloadSamples(filename, samples);
	        }
	        else if(mode === 3) {
	        	downloadPNG(filename);
	        }
	      }
	    },
	    cancel: {
	    	label: "Cancel",
	    	className: "btn-bayes",
	    }
	  }
	});
};

var checkUploadFileExtension = function(filetype, extension) {
	return filetype == extension;
}

var downloadNetwork = function(filename){
	var compactEdges = []
	edges.forEach(function(e) {
		var compactEdge = {source: e.source.id, target:e.target.id};
		compactEdges.push(compactEdge);
	})
	var netObject = JSON.stringify({
		"nodes":nodes,
		"edges":edges
	}, null, 2);

	var blob = new Blob([netObject], {type:"text/plain;charset=utf-8"});

	// console.log(filename);	
	if (!isEmptyString(filename)) {
		filename = filename + ".json";
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

//parts of the code have been taken from http://blog.teamtreehouse.com/reading-files-using-the-html5-filereader-api
var uploadNetwork = function(){
	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var fileReader = new FileReader();
		var uploadFile = d3.select("#hidden-upload").node().files[0];

		//check if it is the correct file type 
		if(!checkUploadFileExtension(uploadFile.type, "application/json")) {
			bootbox.dialog({
			  message: "The uploaded file needs to be .json",
			  buttons: {
			    main: {
			      label: "OK",
			      className: "btn-bayes-short",
			    },
			  }
			});					
			return;
		}

		//update the dataset name
		d3.select("#dataset-name")
		.html("Dataset: " + uploadFile.name)
		.classed("notice-text", true);
		// update glyphicons if changes have happened
		d3.select("#glyphicon-struct").remove();
		d3.select("#p-struct").append("span")
							  .attr("id", "glyphicon-struct")
							  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
							  .attr("aria-hidden", "true");	
		d3.select("#glyphicon-params").remove();
		d3.select("#p-params").append("span")
							  .attr("id", "glyphicon-params")
							  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
							  .attr("aria-hidden", "true");

		fileReader.onload = function(){
			var txt = fileReader.result;
			try {
				var netObj = JSON.parse(txt);
				deleteNetwork(false);

				//clear the display field
				clearDisplayField();

				nodes = netObj.nodes;
				var rawEdges = netObj.edges;
				rawEdges.forEach(function(e, index){
					var src = nodes.filter(function(n) {
						return n.id === e.source.id;
					})[0];
					var tgt = nodes.filter(function(n) {
						return n.id === e.target.id; 
					})[0];	
					rawEdges[index] = {source: src, target:tgt}; 
				})
				edges = rawEdges;
				//find the max index in the nodes
				lastID = maxNodeId();
				//set the status to uploaded
				uploaded = true;
				refresh();
				//set mode to default
				// setDefaultMode();
				//display instructions
				displayHelp();

			}
			catch(err){
				bootbox.dialog({
				  message: "Error occured while parsing the file.",
				  buttons: {
				    main: {
				      label: "OK",
				      className: "btn-bayes-short",
				    },
				  }
				});					
			}
		}

		fileReader.readAsText(uploadFile);
		document.getElementById("hidden-upload").value = "";
	}
	else {
		bootbox.dialog({
		  message: "Your browser does not support this functionality.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});			
	}
}

//Initialise
var loadDefaultNetwork = function(filepath, isInitial, val) {
	// get file's name
	var fileName = filepath.split("/")[filepath.split("/").length-1];
	// update dataset header
	d3.select("#dataset-name")
		.html("Dataset: " + fileName)
		.classed("notice-text", true);

	// disable learning controls
	d3.select("#learnStruct")
	  .classed("disabled", true);
	d3.select("#learnParams")
	  .classed("disabled", true);
	  
	// update glyphicons if changes have happened
	d3.select("#glyphicon-struct").remove();
	d3.select("#p-struct").append("span")
						  .attr("id", "glyphicon-struct")
						  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
						  .attr("aria-hidden", "true");	
	d3.select("#glyphicon-params").remove();
	d3.select("#p-params").append("span")
						  .attr("id", "glyphicon-params")
						  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
						  .attr("aria-hidden", "true");


	//delete previous network
	deleteNetwork(false);
	d3.json(filepath, function(error, netData) {
	// process the nodes
	  nodes = netData.nodes;
	  // process the edges
	  var rawEdges = netData.edges;
	  rawEdges.forEach(function(e, index){
	  	var src = nodes.filter(function(n) {
	  		return n.id === e.source.id;
	  	})[0];
	  	var tgt = nodes.filter(function(n) {
	  		return n.id === e.target.id; 
	  	})[0];	
	  	rawEdges[index] = {source: src, target:tgt}; 
	  })
	  edges = rawEdges;
	  //find the max index in the nodes
	  lastID = maxNodeId();
	  //set the status to uploaded
	  uploaded = true;

	  //render  
	  refresh();
	  //set mode to default
	  // setDefaultMode();
	  if (isInitial) {
		//display instructions
		displayHelp();
	  }
	  else {
	  	loadExampleNetworks(val);
	  }; 		  
	});
};

// local filepath to example network
var identifyExampleNetFilepath = function(val) {
	if(val === "rain") {
		loadDefaultNetwork("files/nets/wetGrassNet.json", false, val)		
	}
	else if(val === "burglary") {
		loadDefaultNetwork("files/nets/burglaryNetFull.json", false, val)
	}
	else if(val === "cancer") {
		loadDefaultNetwork("files/nets/cancerNet.json", false, val)		
	}
	else if(val === "bronchitis") {
		loadDefaultNetwork("files/nets/smokerBronchitis.json", false, val)
	}
	else if(val === "asia") {
		loadDefaultNetwork("files/nets/asia.json", false, val);
	}
	else if(val === "alarm") {
		loadDefaultNetwork("files/nets/alarm.json", false, val);
	}
};

// example networks
var loadExampleNetworks = function(selValue) {
	clearDisplayField();
	// deselect the node if such is selected
	selectedNode = null;
	selectedPath = null;
	refresh();

	//append select for different example networks
	var form = control.append("div")
					  .attr("class", "form-group")

	form.append("label")
		.attr("for", "example-net")
		.attr("class", "label-text")
		.text("Select an example network from the menu: ")

	var select = form.append("select")
					 .attr("id", "example-net")
					 .attr("class", "form-control")
					 .on("change", function() {
					 	identifyExampleNetFilepath(this.options[this.selectedIndex].value);
					 });
	select.append("option")
		  .attr("value", "none")
		  .attr("disabled", true)
		  .attr("selected", true)
		  .text("Select Network:")
	select.append("option")
		  .attr("value", "alarm")
		  .text("Alarm");	  
	select.append("option")
		  .attr("value", "asia")
		  .text("Asia");
	select.append("option")
		  .attr("value", "bronchitis")
		  .text("Basic Bronchitis");
	select.append("option")
		  .attr("value", "burglary")
		  .text("Burglary");
	select.append("option")
		  .attr("value", "cancer")
		  .text("Cancer");
	select.append("option")
		  .attr("value", "rain")
		  .text("Rain");		  

	// control.append("hr");

	var options = select.selectAll("option")[0];
	options.forEach(function(option) {
		if(option.value === selValue) {
			d3.select(option)
			  .attr("selected", true);
		}
	});
};

// load a dataset
var loadDataset = function(filepath, val) {
	// get file's name
	var fileName = filepath.split("/")[filepath.split("/").length-1];
	// update dataset header
	d3.select("#dataset-name")
		.html("Dataset: " + fileName)
		.classed("notice-text", true);	

	// load the data
	d3.csv(filepath, function(data){
		// get the csv data
		csvData = data;
		//reformat the data
		fData = formatUploadSample(csvData);
		//get the variables names and create nodes
		createNodes(fData);
		// keep the select on the right-side menu
		loadExampleData(val);
	})

	// update the controls
	d3.select("#learnStruct")
	  .classed("disabled", false);
	d3.select("#learnParams")
	  .classed("disabled", false);

	// update glyphicons if changes have happened
	d3.select("#glyphicon-struct").remove();
	d3.select("#p-struct").append("span")
						  .attr("id", "glyphicon-struct")
						  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
						  .attr("aria-hidden", "true");	
	d3.select("#glyphicon-params").remove();
	d3.select("#p-params").append("span")
						  .attr("id", "glyphicon-params")
						  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
						  .attr("aria-hidden", "true");
};

// dataset filepath
var identifyExampleDataFilepath = function(val) {
	if (val === "cancer") {
		loadDataset("files/datasets/cancer80000.csv", val);
	}
	// else if (val === "asia") {
	// 	loadDataset("files/datasets/asia50000.csv", val);
	// }
	else if (val === "rain") {
		loadDataset("files/datasets/rain1000.csv", val);
	}
	else if (val === "burglary") {
		loadDataset("files/datasets/burglary20000.csv", val);
	}
};

// example datasets
var loadExampleData = function(selected) {
	clearDisplayField();
	// deselect the node if such is selected
	selectedNode = null;
	selectedPath = null;
	refresh();

	//append select for different example networks
	var form = control.append("div")
					  .attr("class", "form-group")

	form.append("label")
		.attr("for", "example-dataset")
		.attr("class", "label-text")
		.text("Select an example dataset from the menu: ")

	var select = form.append("select")
					 .attr("id", "example-dataset")
					 .attr("class", "form-control")
					 .on("change", function() {
					 	identifyExampleDataFilepath(this.options[this.selectedIndex].value);
					 });
	select.append("option")
		  .attr("value", "none")
		  .attr("disabled", true)
		  .attr("selected", true)
		  .text("Select Dataset:")
	// select.append("option")
	// 	  .attr("value", "asia")
	// 	  .text("Asia")
	select.append("option")
		  .attr("value", "burglary")
		  .text("Burglary");
	select.append("option")
		  .attr("value", "cancer")
		  .text("Cancer");
	select.append("option")
		  .attr("value", "rain")
		  .text("Rain");		  

	// used when the function is called after a dataset is loaded and we want to keep the select menu
	// sets the select to the correct selected value
	var options = select.selectAll("option")[0];
	options.forEach(function(option) {
		if(option.value === selected) {
			d3.select(option)
			  .attr("selected", true);
		}
	});
};

//download the canvas as png format
var downloadPNG = function(filename) {
	var filePngName = filename + ".png";
	saveSvgAsPng(svg[0][0], filePngName);	
};

// parse the bif file text to get the nodes, the connections and the cpt values
var parseBif = function(txtBif){
	// delete displayed network
	deleteNetwork(false);
	// get an array of lines from the txt file
	var lines = txtBif.split("\n");

	//go through each line and parse it according to rules
	for(var i=0; i<lines.length; i++) {
		var res;

		// check if the line starts with variable
		if((res = lines[i].match(/variable (.+) \{/))) {
			var name = res[1];

			// parse next line to get variable type and values
			i++;
			res = lines[i].match(/  type (.+) \[ (\d+) \] \{ (.+) \};/);
			// check if it is discrete
			// don't allow continuous variables
			if(res[1] != "discrete") {
				// alert
				// TODO
				return false;
			}

			// get number of values and values' names
			var values = res[3].split(", ");
			// create a node with this name and these values
			addFileNode(name, values);
			// refresh the display to get the nodes set up with tables
			// TODO find another way
			refresh();
		}
		// check if the line starts with probability
		else if((res = lines[i].match(/probability \( (.+) \) \{/))) {
			// all involved nodes
			var allNodes = res[1].split(" | ");
			// current node
			var currNodeName = allNodes[0];
			var currNode = nodes.filter(function(n){
				return n.title === currNodeName;
			})[0];

			var parents;
			// check for conditional probability => create a link
			if(allNodes[1]) {
				parents = allNodes[1].split(", ");
				for (var p in parents) {
					var parentNode = nodes.filter(function(n) {
						return n.title === parents[p];
					})[0];
					// create a connection from parent to current node
					createNewEdge(parentNode, currNode);
				}
			}

			// console.log("get cpt values");
			// iterate over the probability values
			while(lines[i+1] !== "}") {
 				// Probability values on this row
				var values = lines[i+1].match(/(\d.\d+)/g);
 				var pattern;
 				if(pattern = lines[i+1].match(/  table /)) {
 					// root node
 					for (var key in currNode.tbl) {
 						currNode.tbl[key] = values.splice(0,1);
 					}
 				}
 				else if(pattern = lines[i+1].match(/  \((.+)\) /)){
	 				// child node
 					//find the ids of the parent nodes
 					var parIDs = [];
					parents.forEach(function(p) {
						var id = nodes.filter(function(n) {
							return n.title == p
						})[0].id;
						parIDs.push(id);
					});
					//get the values for parents on this row
					var parentRowVals = pattern[1].split(", ");

					// map index to value
					var pairsIdVal = [];
					for(var pair=0; pair<parIDs.length; pair++) {
						pairsIdVal.push(parIDs[pair] + "" + parentRowVals[pair]);
					}					
					// NOTE: JavaScript sorts lexicographically instead of numerically
					// e.g. [8,35] will be sorted as [35, 8]
					// parIDs.sort();
					pairsIdVal.sort();

					var tbl = currNode.tbl;
					//get to the leaf level for these values
					for (var level =0; level<pairsIdVal.length; level++) {
						// tbl = tbl[parIDs[level] + "" + parentRowVals[level]];
						tbl = tbl[pairsIdVal[level]]
					}

					// update the tbl values (one row)
					for(var key in tbl) {
						tbl[key] = values.splice(0,1);
					}
 				}
 				i++
			}
		}

	}

	// display
	refresh();
	// Successful parsing
	return true;
}

// upload Bif network
var uploadBif = function() {
	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var fileReader = new FileReader();
		var uploadFile = d3.select("#hidden-upload-3").node().files[0];
		
		//check if it is bif
		var extension = uploadFile.name.split(".")[uploadFile.name.split(".").length-1];
		if(!checkUploadFileExtension(extension, "bif")) {
			bootbox.dialog({
			  message: "The uploaded file needs to be .bif",
			  buttons: {
			    main: {
			      label: "OK",
			      className: "btn-bayes-short",
			    },
			  }
			});					
			return;
		}

		//update the dataset name
		d3.select("#dataset-name")
		.html("Dataset: " + uploadFile.name)
		.classed("notice-text", true);

		// update glyphicons if changes have happened
		d3.select("#glyphicon-struct").remove();
		d3.select("#p-struct").append("span")
							  .attr("id", "glyphicon-struct")
							  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
							  .attr("aria-hidden", "true");	
		d3.select("#glyphicon-params").remove();
		d3.select("#p-params").append("span")
							  .attr("id", "glyphicon-params")
							  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
							  .attr("aria-hidden", "true");
		fileReader.onload = function(event){
			// TODO make local var
			txtBif = fileReader.result;
			parseBif(txtBif);
			refresh();

			// add to force layout
			// forceLayout(nodes, edges);
		}
		fileReader.onerror = function() {
			bootbox.dialog({
			  message: "Unable to read the file " + uploadFile.fileName,
			  buttons: {
			    main: {
			      label: "OK",
			      className: "btn-bayes-short",
			    },
			  }
			});				
		}
		fileReader.readAsText(uploadFile);		

		//reset the value
		document.getElementById("hidden-upload-3").value = "";
	}
	else {
		bootbox.dialog({
		  message: "The File APIs are not supported in this browser. Please try again in a different one.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});			
	}	
}

// loading image when running function
var loader = function() {
  return function() {
    // var radius = 100;
    // var tau = 2 * Math.PI;

    // var arc = d3.svg.arc()
    //         .innerRadius(radius*0.7)
    //         .outerRadius(radius*0.9)
    //         .startAngle(0);

    var loaderG = svg.append("g")
        .attr("id", "imgLoader")
        .attr("transform", "translate(" + (svg.attr("width") / 2 - 240) + "," + (svg.attr("height") / 2 -160) + ")");

    var img = loaderG.append("image")
                 .attr("x", 0)
                 .attr("y", 0)
                 .attr("width", 480)
                 .attr("height", 320)
                 .attr("xlink:href", "img/loading.gif")
    // var text = loaderG.append("text")
				// 	.attr("x", -35)
    //                 .attr("y", 0)
    //                 .text("Loading...")
    //                 .attr("font-family", "sans-serif")
    //                 .attr("font-size", "20px")
    //                 .attr("fill", "#CC0B7C");    

    // var background = loaderG.append("path")
    //         .datum({endAngle: 0.33*tau})
    //         .style("fill", "#CC0B7C")
    //         .attr("d", arc)
    //         .call(spin, 1500)

    // function spin(selection, duration) {
    //     selection.transition()
    //         .ease("linear")
    //         .duration(duration)
    //         .attrTween("transform", function() {
    //             return d3.interpolateString("rotate(0)", "rotate(360)");
    //         });

    //     setTimeout(function() { spin(selection, duration); }, duration);
    // }

    // function transitionFunction(path) {
    //     path.transition()
    //         .duration(7500)
    //         .attrTween("stroke-dasharray", tweenDash)
    //         .each("end", function() { d3.select(this).call(transition); });
    // }

  };
}