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

var checkNamesSample = function(data) {
	var dataNames = Object.keys(data);
	var nodesNames = nodes.map(function(node) {return node.title});
	return _.isEqual(dataNames.sort(), nodesNames.sort());
}

var recalculateValues = function(fdata) {
	//for each node name in the formatted data
	for (var nodeName in fdata) {
		//find if there is a node with that name
		var node = nodes.filter(function(n) {
			return n.title === nodeName;
		})[0];
		var newValues = _.uniq(fdata[nodeName]);
		node.values = newValues;
		createCPT(node);
	}
}

var learnCPTSingleNode = function(level, parents, csv, cpt) {
	if (level === parents.length-1) {
		var leafId = parents[level];

		var leaf = nodes.filter(function(node) {
			return node.id === leafId;
		})[0];
		var values = leaf.values;

		values.forEach(function(value) {
			var occurrences = _.filter(csv, function(row) {
				return row[leaf.title] === value;
			});
			var entry = leafId + value;
			cpt[entry] = occurrences.length / csv.length

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
			var occurrences = _.filter(csv, function(row){
				return row[parent.title] === value;
			});
			var entry = parentId + value;
			learnCPTSingleNode(level, parents, occurrences, cpt[entry]);
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

var learnCPTValues = function(fdata, csvdata) {
	for(var key in fdata) {
		var node = nodes.filter(function(n){
			return n.title === key;
		})[0];
		if(node) {
			var parents = getNodeParents(node);
			parents.push(node.id);
			learnCPTSingleNode(0, parents, csvdata, node.tbl);
		}
	}
}

var uploadSample = function(){
	//if edit node mode - remove tables of the nodes
	if(editNodeMode) {
		editNodeEnter();
	}

	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var fileReader = new FileReader();
		var uploadFile = d3.select("#hiddenUpload2").node().files[0];
		// console.log(uploadFile);
		// fileReader.readAsText(uploadFile);		
		fileReader.onload = function(event){
			var txt = fileReader.result;
			var csvData = d3.csv.parse(txt);

			//reformat the data
			var fData = formatUploadSample(csvData);
			//assign the values from the sample to the nodes
			var matching = checkNamesSample(fData);

			clearDisplayField();
			if(matching) {
				//recalculate the cpts
				recalculateValues(fData);
				//learn the cpt values from the sample data
				learnCPTValues(fData, csvData);

				//success message
				var successDiv = control.append("div")
										.attr("class", "alert-text alert alert-success");
				successDiv.append("span")
						 	.attr("class", "glyphicon glyphicon-ok")
							.attr("aria-hidden", "true");
				successDiv.append("span")
							.attr("class", "sr-only")
							.text("Success");
				var text = successDiv.html() + " CPT values have been succesfully learned.";
				successDiv.html(text);							
			}
			else {
				//error message
				var errorDiv = control.append("div")
							   .attr("class", "alert-text alert alert-danger");
				errorDiv.append("span")
						.attr("class", "glyphicon glyphicon-exclamation-sign")
						.attr("aria-hidden", "true");
				errorDiv.append("span")
						.attr("class", "sr-only")
						.text("Error");
				var text = errorDiv.html() + " The node names in the uploaded sample data do not match the node names in the current network.";
				errorDiv.html(text);				
			}
		
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
			// alert("Unable to read the file " + uploadFile.fileName);
		}
		fileReader.readAsText(uploadFile);		

		//reset the value
		document.getElementById("hiddenUpload2").value = "";
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