// raw text from the csv
var rawTxt,
    csvData,
    fData;

//format the first 3 rows of the csv data to display in the dialog window
var tableCsv = function(rows) {
	var htmlString ='<div class="form-group"><table class="table table-dialog"><tbody>';

	for (var row in rows) {
		htmlString += '<tr>';
		for (var item in rows[row]) {
			htmlString += '<td>' + rows[row][item] + '</td>'
		}
		htmlString += '</tr>';
	}

	htmlString += '</tbody></table></div>';
	return htmlString;
};

//add a table with names for the columns to the dialog box
var columnNames = function(id, firstLine) {	
	// clear the contents
	d3.select("#column-names").html("");
	//label
	d3.select("#column-names")
	  .append("label")
	  .attr("class", "col-md-3 control-label")
	  .attr("for", "table-node-titles")
	  .html("Nodes' Titles");
	// new table 
	var tblBody = d3.select("#column-names")
					.append("table")
					.attr("id", "table-node-titles")
					.classed("table table-dialog", true)
					.append("tbody");

	if (id == "yes-header") {
		for(var name in firstLine) {
			var row = tblBody.append("tr");
			var i = parseInt(name) + 1;
			row.append("td")
			   .html("Node " + i);
			row.append("td")
			   .append("input")
			   .attr("type", "text")
			   .attr("class", "csv-header")
			   .attr("value", firstLine[name]);
		}
	}
	else if (id == "no-header") {
		for(var i=1; i<=firstLine.length; i++) {
			var row = tblBody.append("tr");
			//append the node title
			row.append("td")
			   .html("Node " + i);
			//append the node name cell
			row.append("td")
			   .append("input")
			   .attr("type", "text")
			   .attr("class", "csv-header")	
			   .attr("value", "X"+i);
		}
	}
}

//dialog window setting when a csv data file is uploaded
var datasetDialogSettings = function(filename, table, firstLine) {
	// var test = firstRow;
	bootbox.dialog({
        title: "CSV Dataset Settings",
        message: '<div class="row">  ' +
            '<div class="col-md-12"> ' +
            '<form class="form-horizontal"> ' +
            
            '<div class="form-group"> ' +
            '<label class="col-md-3 control-label" for="datasetName">Dataset: </label> ' +
            '<div id="datasetName" class="col-md-6 csv-settings-text"> ' + filename + '</div> ' +
            '</div>' + 
            table +
            '<div class="form-group">' +                    
            '<label class="col-md-4 control-label" for="header">Does the uploaded CSV file have a header?</label> ' +
            '<div class="col-md-4">' + 
            '<div class="radio"> <label for="yes-header"> ' +
            '<input type="radio" name="header" id="yes-header" value="Yes" checked="checked">Yes</label></div>' +
            '<div class="radio"> <label for="no-header"> ' +
            '<input type="radio" name="header" id="no-header" value="No">No</label></div>' +
            '</div></div>' +
            
            '<div id="column-names" class="form-group"></div>' +
            '</form></div></div>',
        buttons: {
            success: {
                label: "Process Data",
                className: "btn-bayes",
                callback: function () {
                	// get the value for the radio button
                    var headerRadioValue = d3.select("input[name='header']:checked").attr("value")
                    //get the nodes' names
                    headers = [];
                    d3.selectAll("input.csv-header")[0].forEach(function(header) {
                    	headers.push(header.value.charAt(0).toUpperCase() + header.value.slice(1));
                    });
                	// TODO check for empty and duplicate values 

                	processCsvData(headerRadioValue, headers, firstLine);
               }
            }
        }
    });
	d3.select("#yes-header")
	  .on("click", function() {
	  	columnNames(this.id, firstLine);
	  });
	d3.select("#no-header")
	  .on("click", function() {
	  	columnNames(this.id, firstLine);
	  })
	document.getElementById("yes-header").click();  
}

//create nodes based on the dataset
//node values are the unique values in the dataset for each node  
var createNodes = function(fdata) {
	//delete the current network
	deleteNetwork(false);
	//clear the dispay field
	clearDisplayField();

	//create nodes - get the name and the possible values for each node from the fData
	var colNames = d3.keys(fdata);
	colNames.forEach(function(name){
		// find the values that these node can take from the data
		var nodeValues = _.uniq(fdata[name]);
		// get the data for this node
		var data = fdata[name];
		var name = name.charAt(0).toUpperCase() + name.slice(1);
		//create new node with the column name as title and the possible values it can take
		addCsvNode(name, nodeValues);
		// TODO map the data to each node
		// addCsvNode(name, nodeValues, data);
	});

	refresh();
}

var formatUploadSample = function(data) {
	var formattedData = {};
	data.forEach(function(row) {
		for(var cName in row) {
			if(cName in formattedData) {
				formattedData[cName].push(row[cName]);
			}
			else {
				formattedData[cName] = [];
				formattedData[cName].push(row[cName]);
			}
		}
	})

	return formattedData;
}

// process csv data based on the dialog box settings 
var processCsvData = function(radioVal, headers, firstLine) {
	if (radioVal == "Yes") {
		// compare the headers to the first line of the rawTxt
		if (headers !== firstLine) {
			//if different -> replace the first line with the headers
			rawTxt = rawTxt.replace(firstLine, headers);			 
		}
	}
	else if(radioVal == "No") {
		rawTxt = headers + '\n' + rawTxt;
	}

	// parse the updated raw text
	csvData = d3.csv.parse(rawTxt);
	//reformat the data
	fData = formatUploadSample(csvData);
	//get the variables names and create nodes
	createNodes(fData);	
};

// var learnCPTSingleNode = function(level, parents, indexes, cpt) {
var learnCPTSingleNode = function(level, parents, csv, cpt) {	
	if (level === parents.length-1) {
		var leafId = parents[level];

		var leaf = nodes.filter(function(node) {
			return node.id === leafId;
		})[0];
		var values = leaf.values;

		values.forEach(function(value) {
			// TODO remove
			var occurrences = _.filter(csv, function(row) {
				return row[leaf.title] === value;
			});
			var numOccurrences = _.filter(leaf.csvData, function(rowVal) {
				return rowVal === value;
			}).length;
			// var occurrences = [];
			// leaf.csvData.forEach(function(val, i) {
			// 	if(val == value && _.contains(indexes,i)) {
			// 		occurrences.push(i);
			// 	}
			// })
			var entry = leafId + value;
			// cpt[entry] = numOccurrences / leaf.csvData.length
			cpt[entry] = occurrences.length / csv.length;
		});
	}
	else if(level < parents.length-1) {
		//get the current parent 
		var parentId = parents[level];
		level++;

		//get this node
		var parent = nodes.filter(function(node) {
			return node.id === parentId;
		})[0];
		var values = parent.values;

		//go through each value
		values.forEach(function(value){
			// TODO remove
			var occurrences = _.filter(csv, function(row){
				return row[parent.title] === value;
			});
			var entry = parentId + value;
			learnCPTSingleNode(level, parents, occurrences, cpt[entry]);
			// var newIndexes = [];
			// parent.csvData.forEach(function(val, i) {
			// 	if(val == value && _.contains(indexes,i)) {
			// 		newIndexes.push(i);
			// 	}
			// });
			// learnCPTSingleNode(level, parents, newIndexes, cpt[entry]);
		});
	}
	else {
		bootbox.dialog({
		  message: "Something unexpected has happened!",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});			
	}
}

// learn the CPT values for a node based on the data and the current structure 
var learnCPTValues = function() {
	// TODO remove
	for(var key in fData) {
		var node = nodes.filter(function(n){
			return n.title === key;
		})[0];
		if(node) {
			var parents = getNodeParents(node);
			parents.push(node.id);
			learnCPTSingleNode(0, parents, csvData, node.tbl);
		}
	}
	// for(var n in nodes) {
	// 	var node = nodes[n];
	// 	if(node.csvData) {
	// 		var parents = getNodeParents(node);
	// 		parents.push(node.id);
	// 		learnCPTSingleNode(0, parents, _.range(0, csvData.length), node.tbl);
	// 	}
	// }
}

//remove the success message
// function used as an argument for the setTimeout
var removeSuccessMsg = function() {
	d3.select("#control").select("div.alert-text").remove();
}

var learnParameters = function() {
	// if data has not been uploaded, warn the user 
	if (!csvData || !fData) {
		bootbox.dialog({
			message: "Import a CSV dataset before trying to learn the parameters.",
			buttons: {
				main: {
				label: "OK",
				className: "btn-bayes-short",
				},
			}
		});	
	}
	else {
		//learn the cpt values from the sample data
		learnCPTValues();

		// if node table is displayed -> redisplay the updated table
		var flag = null;
		if (d3.select("#control").select("h3.node-label")[0][0] !== null) {
			flag = parseInt(d3.select("#control").select("h3.node-label")[0][0].id);
		}
		else {
			// clear the display field
			// only clear the display field if it is different from displaying node info
			clearDisplayField();			
		}

		//success message
		var successDiv = control.insert("div", "h3.node-label")
								.attr("class", "alert-text alert alert-success");
		successDiv.append("span")
				 	.attr("class", "glyphicon glyphicon-ok")
					.attr("aria-hidden", "true");
		successDiv.append("span")
					.attr("class", "sr-only")
					.text("Success");
		var text = successDiv.html() + " CPT values have been updated successfully.";
		successDiv.html(text);

		//remove after 3 seconds
		setTimeout(removeSuccessMsg, 3000);

		//redisplay the table
		if (flag !== null) {
			var nodeSelected = nodes.filter(function(node) {
				return node.id === flag;
			})[0];
			displayCPT(nodeSelected);
			flag=null;
		}									
	}
}

// TODO why need this?
// var createMatrixFromCsv = function(csvdata) {
// 	var matArray = [];
// 	csvdata.forEach(function(row) {
// 		var rowArray = [];
// 		for (var cell in row) {
// 			rowArray.push(row[cell]);
// 		}
// 		console.log(rowArray);
// 		matArray.push(rowArray);
// 	});

// }

var uploadSample = function(){
	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var fileReader = new FileReader();
		var uploadFile = d3.select("#hidden-upload-2").node().files[0];
		//check if it is csv
		if(!checkUploadFileExtension(uploadFile.type, "text/csv")) {
			bootbox.dialog({
			  message: "The uploaded file needs to be .csv",
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

		fileReader.onload = function(event){
			rawTxt = fileReader.result;		

			//rows of the csv - no header assumed
			var rows = d3.csv.parseRows(rawTxt);
			var tblString = tableCsv(rows.slice(0,3));

			//get settings from the user for the dataset
			//parameters needed: 
			// 1)filename
			// 2)table string of the first 3 rows of the csv
			// 3)header line
			var firstLine = rows.slice(0,1)[0];
			datasetDialogSettings(uploadFile.name, tblString, firstLine);
		
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
		document.getElementById("hidden-upload-2").value = "";
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