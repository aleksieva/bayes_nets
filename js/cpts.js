var isValidCPTEntry = function(num) {
	if(isNaN(num)) {
  		return false;
  	}
  	else if(num < 0 || num > 1) {
  		return false;
  	}
  	return true;
}

var validateUpdate = function() {
	var validEntries = true;
	var validRowSums = true;

	var rows = d3.selectAll(".editable-cpt-row")
				 .each(function(d, i) {
				 	var sumProb = 0;
				 	d3.select(this)
				 	  .selectAll("td.editable")
				 	  .selectAll("input")
				 	  .each(function(d, i) {
				 	  	if(isValidCPTEntry(this.value) && !isEmptyString(this.value)) {
				 	  		sumProb += parseFloat(this.value);
				 	  		d3.select(this)
				 	  		  .classed("invalid", false);
				 	  	}
				 	  	else {
				 	  		validEntries = false;
					  		d3.select(this)
					  		  .classed("invalid", true);
				 	  	}
				 	  });
				 	  console.log(sumProb);
				 	  if (sumProb !== 1) {
				 	  	validRowSums = false;
				 	  }
				 });


	if (!validEntries) {
		//error message
		// var errorDiv = control.insert("div", "#edit-div-tbl")
		var errorDiv = d3.select("#edit-div-tbl").insert("div", ".cpt-table")	
							   .attr("class", "alert-text alert alert-danger")
		errorDiv.append("span")
				.attr("class", "glyphicon glyphicon-exclamation-sign")
				.attr("aria-hidden", "true");
		errorDiv.append("span")
				.attr("class", "sr-only")
				.text("Error");
		var text = errorDiv.html() + " Enter a valid probability value between 0 and 1.";
		errorDiv.html(text);				
	}

	if(!validRowSums) {
		//error message
		// var errorDiv = control.insert("div", "#edit-div-tbl")
		var errorDiv = d3.select("#edit-div-tbl").insert("div", ".cpt-table")	
							   .attr("class", "alert-text alert alert-danger");
		errorDiv.append("span")
				.attr("class", "glyphicon glyphicon-exclamation-sign")
				.attr("aria-hidden", "true");
		errorDiv.append("span")
				.attr("class", "sr-only")
				.text("Error");
		var text = errorDiv.html() + " Probabilities on one row must sum up to 1.";
		errorDiv.html(text);				
	}

	return validEntries && validRowSums;
}

//update table values when edited
var updateTbl = function(){
	//clear previous error messages
	control.selectAll(".alert-text").remove();

	var tblId = d3.select(".cpt-table").attr("id");
	if(!tblId) {
		bootbox.dialog({
		  message: "Table does not exist.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});			
	}

	var currCpt = nodes.filter(function(node) {
		return node.id === parseInt(tblId);
	})[0].tbl;
	if(!currCpt){
		bootbox.dialog({
		  message: "The CPT for this nodes cannot be accessed.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});			
	}

	var valid = validateUpdate();
	if(!valid)
		return

	var cells = d3.selectAll("td.editable")
				  .selectAll("input")
				  .each(function(d, i) {
					var path = this.id.split("->");
					//the nested cpt 
					var nestedCpt = currCpt;
					//get to the last level of the cpt
					for (var i=0; i<path.length-1; i++) {
						nestedCpt = nestedCpt[path[i]];
					}
		 			nestedCpt[path[path.length-1]] = parseFloat(this.value);
				  });

	// var successDiv = d3.select("#div-update-btn").insert("div", "#edit-div-tbl")
	var successDiv = d3.select("#edit-div-tbl").insert("div", ".cpt-table")	
						   .attr("class", "alert-text alert alert-success");
	successDiv.append("span")
			.attr("class", "glyphicon glyphicon-ok")
			.attr("aria-hidden", "true");
	successDiv.append("span")
			.attr("class", "sr-only")
			.text("Success");
	var text = successDiv.html() + " Successfully updated.";
	successDiv.html(text);							  
}

var updateCell = function(cell, node){
	var row = cell.node().parentNode.parentNode;
	var allCells = d3.select(row).selectAll("input")[0];

	//two values only
    if(node.values.length === 2) {
    	allCells.forEach(function(c) {
    		if(c !== cell.node()) {
    			// (q- value * q) /q
    			// c.value = (10 - parseFloat(cell.node().value)*10)/10;
    			c.value = (1 - parseFloat(cell.node().value)).toFixed(cell.node().value.split(".")[1].length);
    		}
    	});
    }	
}

var html = "";
var createCPTRows = function(dataStr, idsList, level) {
	if (level === idsList.length-1) {
		var lastEl = idsList[level];

		var values = nodes.filter(function(node) {
			return node.id === lastEl;
		})[0].values;

		//initial probability for each value is 1 / N
		// N - number of possible values
		var initialValue = 1.0 / values.length;
		values.forEach(function(value) {
			var option = lastEl + value;
			dataStr[option] = initialValue;
		})
	}
	else if(level < idsList.length-1) {
		//get the element from the front of the list
		var currEl = idsList[level];
		level++;

		var values = nodes.filter(function(node) {
			return node.id === currEl;
		})[0].values;
		//branch for each possible value
		values.forEach(function(value) {
			var option = currEl + value;
			dataStr[option] = {};
			createCPTRows(dataStr[option], idsList, level, values);
		})
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

var displayCPTRows = function(cpt, list, level, chain) {
	//Base case
	if (level == list.length -1) {
		var lastEl = list[level];

		var values = nodes.filter(function(node) {
			return node.id === lastEl;
		})[0].values;

		values.forEach(function(value) {
			var currVal = cpt[lastEl + value];
			var currChain = chain + lastEl + value;
			html += '<td class="editable"> <input type="text" id="' + currChain + '" value="' + currVal + '"></td> ';
		})

		d3.select(".cpt-table")
		  .append("tr")
		  .classed("editable-cpt-row", true)
		  .html(html);

	}
	//Recursive case
	else if (level < list.length -1) {
		var currEl = list[level];
		level++;

		var tmpHtml = html;
		var tmpChain = chain;

		var values = nodes.filter(function(node) {
			return node.id === currEl;
		})[0].values;

		values.forEach(function(value) {
			html = tmpHtml;
			chain = tmpChain;
			chain += currEl + value + "->";
			html += "<td>" + value + "</td>";
			var cptCurrOption = cpt[currEl + value];
			displayCPTRows(cptCurrOption, list, level, chain, values);
		})
	}
	//Error
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

var cptColumnNames = function(parents, values){
	var names = [];

	// get parents' names
	parents.forEach(function(parent) {
		var filteredNode = nodes.filter(function(n) {
			return n.id === parent;
		})[0];
		// names.push(filteredNode.title.charAt(0).toUpperCase());
		// TODO try
		names.push(filteredNode.title);
	})

	var currName = "P(" + names[names.length-1];
	var nodeNameValues = [];
	//go over possible values
	values.forEach(function(value) {
		nodeNameValues.push(currName + "=" + value);
	})	

	//go over all the elements except the last element - the current node
	// it defines the columns
	var conditionalVariables = ""
	for (var i=0; i<names.length-1; i++) {		
		html += '<th>' + names[i] + '</th>';
		conditionalVariables += names[i] + ',';
	}
	conditionalVariables = conditionalVariables.substring(0, conditionalVariables.length-1)


	//append different value columns for this node
	nodeNameValues.forEach(function(option) {
		if(names.length === 1) {
			html += '<th>' + option + ')</th>';
		}
		else if (names.length > 1) {
			html += '<th>' + option + "|" + conditionalVariables + ')</th>';
		}
	})

	d3.select(".cpt-table").append("thead").append("tr").html(html);
	html = "";
}

//create table on added node
var createCPT = function(d) {
	//get the parents for this node
	var parents = getNodeParents(d);
	parents.push(d.id);

	var cpt = {};
	if(d.tbl && uploaded) {
		cpt = d.tbl;
	}
	else {
		//create the internal cpt representation
		createCPTRows(cpt, parents, 0);		
		//assign the table as property of the current node
		d.tbl = cpt;
	}
}

var displayCPT = function(d) {
	//clear table display
	// d3.select("#edit-div-tbl").html("");
	d3.select("#div-update-btn").html("");

	html = "";

	//attach a new table
	d3.select("#div-update-btn")
	  .append("div")
	  .attr("class", "table-responsive div-table")
	  .attr("id", "edit-div-tbl")
	  .append("table")
	  .attr("id", d.id)
	  .attr("class", "cpt-table table table-bayes");

	//get parents for this node that its cpt is going to depend on	
	var parents = getNodeParents(d);
	parents.push(d.id);

	//CPT column names
	cptColumnNames(parents, d.values);
	
	var cpt = d.tbl;

	//display the cpt
	displayCPTRows(cpt, parents, 0, "");

	d3.selectAll("td.editable")
	  .selectAll("input")
	  .on("focus", function() {
	  	// enable the save changes btn
	  	d3.select("#save-changes-btn")[0][0].disabled = false;
	  })
	  .on("blur", function() {
	  	updateCell(d3.select(this), d);
	  })
	
	// // Handling editing CPTs events
 // 	d3.select("#div-update-btn")
 // 	// d3.select(".cpt-table")
 // 	  .append("button")
 // 	  .attr("class", "btn btn-default btn-bayes")
 // 	  .attr("id", "cpt-update-btn")
 // 	  .html("Save Changes")
 // 	  .on("click", updateTbl);
}

var recalculateCPT = function(edgesArray, sourceNode) {
	var targetNodes = [];
	// console.log(edgesArray);
	// console.log(sourceNode);
	for (var edge in edgesArray) {
		if (edgesArray[edge].source === sourceNode) {
			targetNodes.push(edgesArray[edge].target);
		}
	}
	// console.log(targetNodes);
	for (var tn in targetNodes) {
		createCPT(targetNodes[tn]);
	}
}
