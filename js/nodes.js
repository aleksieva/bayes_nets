//code taken from http://bl.ocks.org/cjrd/6863459
var multipleLinesText = function(text, d3elem) {
	//remove the text in the circle first
	d3elem.select("text")
		  .remove();

	var wordsLines = text.split(/\s+/g);
	var txtElem = d3elem.append("text")
						.attr("class", "node-title")
						.attr("text-anchor", "middle")
			            .attr("dy", "-" + (wordsLines.length-1)*7.5);

	for (var i=0; i<wordsLines.length; i++) {
		var tspanElem = txtElem.append("tspan")
							   .text(wordsLines[i]);
		if (i > 0) {
			tspanElem.attr("x", 0).attr("dy", 15);
		}
	}
}

//if the new name is a duplicate of another node name - new name -> name(1).. name(2) etc.
var duplicateNodeTitles = function(newTitle, node) {
	var flag;
	var i = 1;
	var name = newTitle;

	do {
		flag = false;
		for(var n in nodes) {
			if(nodes[n] !== node && nodes[n].title === name) {
				name = newTitle + '(' + i + ')';
				i++;
				flag = true;
			}
		}
	} while(flag);

	return name;
}

// editable h3 node label
var editableNodeLabel = function(node) {
	//append node title
	control.append("h3")
		   .text(node.title)
		   .classed("node-label", true)
		   .attr("id", node.id)
		   .on("click", function() {
		   	//on click of the label - hide it and show the input text field
		   	d3.select(this)
		   	  .style("display", "none");
		   	d3.select("#edit-node-input")
		   	  .style("display", "initial")
		   	  .node().focus();
		   });

	//append input field for user to be able to edit the node name from
	//TODO shorter + limited number of symbols - 50/30?
	control.append("input")
		   .classed("node-input", true)
		   .attr("id", "edit-node-input")
		   .attr("type", "text")
		   .attr("value", node.title)
		   .style("display", "none")
		   .on("keypress", function() {
				if(d3.event.keyCode === constants.ENTER) {
					d3.event.preventDefault();
					this.blur();
				}
		   })
		   .on("blur", function(){
		   		//if it is not an empty string -> update the node's title
				if(!isEmptyString(this.value)) {
					var prevTitle = node.title;
 					node.title = this.value.trim();
 					//check for multiple words title and capitalize every word first letter
 					var wordsTitle = node.title.split(" ");
 					node.title = "";
 					for (var word in wordsTitle) {
 						node.title += wordsTitle[word].charAt(0).toUpperCase() + wordsTitle[word].slice(1) + " ";
 					}
 					node.title = node.title.slice(0,-1);
 					// TODO remove
 					// node.title = node.title.charAt(0).toUpperCase() + node.title.slice(1);
 					//check for duplicates
 					node.title = duplicateNodeTitles(node.title, node);
					   	
					var circleElem = d3.selectAll(".node")
									.filter(function(n) { 
										return (n.id === node.id)
									});
					//update the circle title
					multipleLinesText(node.title, circleElem);
					//update and display the label
					d3.select("h3.node-label")
					  .text(node.title)
					  .style("display", "initial");
					//hide the input
					d3.select(this)
					  .style("display", "none");
					// update the cpt
					displayCPT(node);

					// if csv data is set update the csv column name
					if(csvData) {
						// TODO
					}
				}
		   });	
}

//append number of input fields depending on the value of input type number
var appendNodeValues = function(num) {
	//count # of old input fields
	var progress = d3.selectAll("tr.nodeValueRow")[0].length;

	var nodeInfo = d3.select("table.node-edit-tbl");

	if(progress < num) {
		//add new rows
		for(var i =progress+1; i<= num; i++) {
			var currRow = nodeInfo.append("tr")
								  .attr("class", "nodeValueRow");
			currRow.append("td")
				   .text("Value " + i);
			currRow.append("td")
				   .attr("class", "editable")
				   .append("input")
				   .classed("nodeValue", true)
				   .attr("type", "text");
		}		
	}
	else if(progress > num) {
		//remove rows
		while(progress > num) {
			d3.selectAll("tr.nodeValueRow")[0][progress-1].remove();
			progress--;
		}
	}

	d3.selectAll("input.nodeValue")
	  .on("blur", function() {
	  	//TODO
	  	//updateValue
   	 	// updateSingleValue(this, d);

	  });	
}

var appendNodeValue = function() {
	var numValues = d3.selectAll("tr.nodeValueRow")[0].length;
	if (numValues < 10) {
		var newRow = d3.select("table.node-edit-tbl")
					.insert("tr", "#plus-minus-row")
					.classed("nodeValueRow", true);
		newRow.append("td")
				.text("Value " + (numValues + 1) + ":");
		newRow.append("td")
				.attr("class", "editable")
				.append("input")
				.classed("nodeValue", true)
				.attr("type", "text");		
	}
}

var removeNodeValue = function() {
	var numValues = d3.selectAll("tr.nodeValueRow")[0].length;
	if(numValues > 2) {
		d3.selectAll("tr.nodeValueRow")[0][numValues-1].remove();
	}
}

var getNodeChildren = function(node) {
	var children = [];

	var targetEdges = edges.filter(function(e) {
		return e.source === node
	});

	targetEdges.forEach(function(edge) {
		console.log(edge.target)
		children.push(edge.target);
	});

	return children;
}

var checkNodeValuesDuplicates = function(values) {
	return _.uniq(values).length === values.length;	
}

//change the values that a particular node can take
var updateNodeValues = function(node){
	//remove error text
	control.selectAll(".alert-text")
		   .remove();

	var newValues = [];
	var isValid = true;
	var cells = d3.selectAll("input.nodeValue")
				  .each(function(d, i) {
				  	console.log(this.value);
				  	if(!isEmptyString(this.value)) {
				  		var fValue = this.value.toLowerCase();
				  		newValues.push(fValue);
					  	// newValues.push(this.value);
				  		d3.select(this)
				  		  .classed("invalid", false);
				  	}
				  	else {
				  		d3.select(this)
				  		  .classed("invalid", true);
				  		isValid = false;			  		
				  	}
				  })

	var isNotDuplicated = checkNodeValuesDuplicates(newValues);

	if (isValid) {
		if(isNotDuplicated) {
			node.values = newValues;
			//recreate cpts
			createCPT(node);
			//recreate cpts of this node children
			var children = getNodeChildren(node);
			children.forEach(function(child){
				createCPT(child);
			})

			//success message
			var successDiv = d3.select("#edit-div-tbl")
								.insert("div", ".node-edit-tbl")	
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
		else {
			//error message for duplicate values
			var errorDiv = d3.select("#edit-div-tbl").insert("div", ".node-edit-tbl")	
								   .attr("class", "alert-text alert alert-danger");
			errorDiv.append("span")
					.attr("class", "glyphicon glyphicon-exclamation-sign")
					.attr("aria-hidden", "true");
			errorDiv.append("span")
					.attr("class", "sr-only")
					.text("Error");
			var text = errorDiv.html() + " Enter non-duplicate values.";
			errorDiv.html(text);					
		}
	}
	else {
		//error message for empty values
		var errorDiv = d3.select("#edit-div-tbl")
						.insert("div", ".node-edit-tbl")	
						.attr("class", "alert-text alert alert-danger");
		errorDiv.append("span")
				.attr("class", "glyphicon glyphicon-exclamation-sign")
				.attr("aria-hidden", "true");
		errorDiv.append("span")
				.attr("class", "sr-only")
				.text("Error");
		var text = errorDiv.html() + " Enter a non-empty value.";
		errorDiv.html(text);						
	}
}

//update a single value on blur of the input field
var updateSingleValue = function(input, node) {
	//TODO
	console.log(input);
	console.log(node);
}

var displayNodeValues = function(d) {	
	d3.select("#div-update-btn").html("");

	var nodeValsDiv = d3.select("#div-update-btn")
						.append("div")
						.attr("class", "table-responsive div-table")
						.attr("id", "edit-div-tbl");

	var appendBtns = nodeValsDiv.append("div")
								.classed("pull-right", true);

	appendBtns.append("button")
			.classed("btn btn-default small-btn", true)
			.attr("value", "add")
			.html("+")
			.on("click", function() {
				appendNodeValue();
				// enable the save changes btn
			  	d3.select("#save-changes-btn")[0][0].disabled = false;		
			});

	appendBtns.append("button")
			.classed("btn btn-default small-btn", true)
			.attr("value", "remove")
			.html("-")
			.on("click", function() {
				removeNodeValue();
				// enable the save changes btn
			  	d3.select("#save-changes-btn")[0][0].disabled = false;			
			});

	// var lastRow = nodeInfo.append("tr")
	// 					  .attr("id", "plus-minus-row");
	// lastRow.append("td");
	// var appendBtns = lastRow.append("td");
	// // TODO styling buttons
	// appendBtns.append("button")
	// 		.classed("btn btn-default btn-bayes-short", true)
	// 		.attr("value", "add")
	// 		.html("+")
	// 		.on("click", function() {
	// 			appendNodeValue();
	// 			// enable the save changes btn
	// 		  	d3.select("#save-changes-btn")[0][0].disabled = false;		
	// 		});

	// appendBtns.append("button")
	// 		.classed("btn btn-default btn-bayes-short", true)
	// 		.attr("value", "remove")
	// 		.html("-")
	// 		.on("click", function() {
	// 			removeNodeValue();
	// 			// enable the save changes btn
	// 		  	d3.select("#save-changes-btn")[0][0].disabled = false;			
	// 		});


	var nodeInfo = nodeValsDiv.append("table")
					 .attr("class", "table table-bayes node-edit-tbl");

	// //add num of values
	// var numOfValues = nodeInfo.append("tr");
	// numOfValues.append("th").text("# values");
	// var testCell = numOfValues.append("th")
	// 		   .attr("class", "editable");

	// testCell.append("input")
	// 		   .attr("type", "number")
	// 		   .attr("id", "numValues")
	// 		   .attr("min", 2)
	// 		   .attr("max", 10)
	// 		   .attr("value", d.values.length)
	// 		   .on("input", function() {
	// 		   	  appendNodeValues(this.value);
	// 		   })
	// 		   .on("keydown", function() {
	// 		   	 d3.event.preventDefault();
	// 		   });
	// testCell.append("button")
	// 		.attr("value", "add")
	// 		.attr("text", "+");

	// append options
	for(var i =1; i<= d.values.length; i++) {
		var currRow = nodeInfo.append("tr")
							  .attr("class", "nodeValueRow");
		currRow.append("td")
			   .text("Value " + i + ":");
		currRow.append("td")
			   .attr("class", "editable")
			   .append("input")
			   .classed("nodeValue", true)			   
			   .attr("type", "text")
			   .attr("value", d.values[i-1])
			   .on("focus", function() {
			   	 // enable the save changes btn
			   	 d3.select("#save-changes-btn")[0][0].disabled = false; 			   	
			   })
			   .on("blur", function() {
			   	 //TODO
			   	 //Update value
			   	 updateSingleValue(this, d);
			   });
	}

	// var lastRow = nodeInfo.append("tr")
	// 					  .attr("id", "plus-minus-row");
	// lastRow.append("td");
	// var appendBtns = lastRow.append("td");
	// // TODO styling buttons
	// appendBtns.append("button")
	// 		.classed("btn btn-default btn-bayes-short", true)
	// 		.attr("value", "add")
	// 		.html("+")
	// 		.on("click", function() {
	// 			appendNodeValue();
	// 			// enable the save changes btn
	// 		  	d3.select("#save-changes-btn")[0][0].disabled = false;		
	// 		});

	// appendBtns.append("button")
	// 		.classed("btn btn-default btn-bayes-short", true)
	// 		.attr("value", "remove")
	// 		.html("-")
	// 		.on("click", function() {
	// 			removeNodeValue();
	// 			// enable the save changes btn
	// 		  	d3.select("#save-changes-btn")[0][0].disabled = false;			
	// 		});

	// d3.select("#div-update-btn")
	//   .append("button")
	//   .classed("btn btn-default btn-bayes pull-right", true)
	//   .attr("id", "update-node-values")
	//   .html("Save Changes")
	//   .on("click", function() {
	//    	updateNodeValues(d);
	//   });
}

var getNodeParents = function(d){
	var nodeParentsIds = [];
	var inConns = edges.filter(function(e) {
		return e.target === d;
	})

	for (c in inConns) {
		nodeParentsIds.push(inConns[c].source.id);
	}
	// console.log("parents " + nodeParentsIds);
	nodeParentsIds.sort();
	return nodeParentsIds;
}

var displayNodeOption = function(option, node) {
	if(option === "cpt") {
		displayCPT(node);
	}
	else if(option === "val") {
		displayNodeValues(node);
	}
}

var updateNodeOption = function(option, node) {
	// update the cpt table
	if(option === "cpt") {
		updateTbl();
	}
	// update node's values
	else if(option === "val") {
		updateNodeValues(node);
	}
}

var displayNodeInfo = function(node) {
	clearDisplayField();

	// node label
	editableNodeLabel(node);	
	control.append("hr");

	//append select for different options
	//option 1 - cpt table - selected
	//option 2 - node values
	var form = control.append("div")
					  .attr("class", "form-group")

	form.append("label")
		.attr("for", "node-options")
		.attr("class", "label-text")
		.text("Select an option for this node: ")

	var select = form.append("select")
					 .attr("id", "node-options")
					 .attr("class", "form-control")
					 .on("change", function() {
					 	displayNodeOption(this.options[this.selectedIndex].value, node);
					 	// disable the save changes btn
					 	d3.select("#save-changes-btn")[0][0].disabled = true;
					 });

	select.append("option")
		  .attr("value", "cpt")
		  .attr("selected", true)		  
		  .text("CPT table");
	select.append("option")
		  .attr("value", "val")
		  .text("Node Values");

	// TODO
	// disables, enable on cpt change or node values change
	var saveChangesBtn = form.append("button")
					  .classed("btn btn-default btn-bayes margin-btn", true)
	  				  .attr("id", "save-changes-btn")
	  				  .attr("disabled", "true")
					  .html("Save Changes")
	  				  .on("click", function() {
					   	// save the changes
					   	// either node's values or node's cpt
					   	var selectCtrl = d3.select("#node-options")[0][0];
					   	var option = selectCtrl.options[selectCtrl.selectedIndex].value;
					   	updateNodeOption(option, node);
	  				  });

	control.append("hr");

	//display the relevant data
	var infoDiv = control.append("div")
						 .attr("id", "div-update-btn");
	
	var selOption = d3.select("#node-options").node().options[d3.select("#node-options").node().selectedIndex].value;
	displayNodeOption(selOption, node);

}

var nodeMouseDown = function(d){
	//TODO move to refresh?
	mousedownNode = d;

	// if(connMode) {
	// enter connection mode if clicking again on the selected node with the left mouse button
	// event.which -> 1: left mouse btn, 2: middle mouse btn, 3: right mouse btn
	if(selectedNode === d && event.which == 1) {
		//set the connection mode
		connecting = true;
		//reposition the dragline to the center of the node
		dragline.classed("hidden", false)
				.attr("d", "M" + d.x + "," + d.y + "L" + d.x + "," + d.y);
	}
}

var nodeMouseUp = function(d, groupNode){
	// console.log(d3.select(d));
	// console.log(groupNode);
	//check if mousedownNode is set
	if(!mousedownNode)
		return;

	//TODO remove
	dragline.classed("hidden", true);

	//the node that the mouse is located on on mouseup
	var mouseupNode = d;
	//if the mouse has moved to a different node and connection mode is on
	//add a new edge between these 2 nodes
	if(mousedownNode !== mouseupNode && connecting) {
	// 	if(connMode) {
			createNewEdge(mousedownNode, mouseupNode);
			connecting = false;
			// dragged =false;
	// 	}
	}
	//the node on mouse up and on mouse down is the same
	// 4 possible cases when this could happen
	// 1. node has been dragged
	// 2. node has been shift clicked to edit its text -TODO REMOVE
	// 3. editNode mode is on and node has been selected for editing - TODO remove
	// 4. select node
	// else {
	if(dragged) {
		dragged = false;
	}
	else {
		//select/deselect node
		if(selectedNode === mousedownNode) {
			selectedNode = null;
		}
		else {
			selectedNode = mousedownNode;
		}
		selectedPath = null;
		refresh();

		//hide all linking points - precaution 
		//alternative -> hide only points that don't belong to the selected node
		// d3.selectAll(".link-node")
		//   .classed("selected", false)
		//   .style("display", "none");

		//display the node info if a node has been selected
		if (selectedNode) {
			displayNodeInfo(selectedNode);
			//TODO display the linking nodes
			// groupNode.selectAll(".link-node")
			//   .classed("selected", true)
			//   .style("display", "initial");
		}
		else {
			//TODO check and remove
			clearDisplayField();
		}
	}
	// }
	
	mousedownNode = null;
	mouseupNode = null;
}

//Added predefinedCircle for Jasmine tests
var addNewNode = function(predefinedCircle) {
	//add new node
	var circleCenter = predefinedCircle ? [100, 200] : d3.mouse(graph.node()),
		xPos = circleCenter[0],
		yPos = circleCenter[1],
		newNode = {id:++lastID, title:"New Node", x:xPos, y:yPos, values:['1', '0']};

	nodes.push(newNode);
	newNode.title = duplicateNodeTitles(newNode.title, newNode);
	//refresh to add the node
	refresh();
	selectedNode = newNode;	
	//refresh to select the node
	refresh();
};

var addFileNode = function(name, values, data) {
	//add a new node found from the csv uploaded file
	var xPos = Math.random() * (svg.attr("width")-radius) + radius,
		yPos = Math.random() * (svg.attr("height")-radius) + radius,
		newNode = {id:++lastID, title:name, x:xPos, y:yPos, values:values};		
		// newNode = {id:++lastID, title:name, x:xPos, y:yPos, values:values, csvData:data};
	nodes.push(newNode);
	newNode.title = duplicateNodeTitles(newNode.title, newNode);
}

var nodeMenu = [
	{
		title: 'Remove Node',
		action: function(elm, d, i) {
			deleteNode(d);
		}
	}
]

var deleteNode = function(node) {
	var children = getNodeChildren(node);
	nodes.splice(nodes.indexOf(node),1);
	var incidentEgdes = removeIncidentEdges(node);
	//recalculate the cpts for all nodes that are target nodes for the selected node
	recalculateCPT(incidentEgdes, node);

	//if node info is displayed 
	if (d3.select(".node-label")[0][0] !== null) {
		var id = parseInt(d3.select(".node-label").attr("id"));
		// if info for this node is displayed remove it and set a message
		if(id === node.id) {
			clearDisplayField();
			//warning message
			var warningDiv = control.append("div")
									.attr("class", "alert-text alert alert-warning")
			warningDiv.append("span")
					  .attr("class", "glyphicon glyphicon-flag")
					  .attr("aria-hidden", "true");
			warningDiv.append("span")
					  .attr("class", "sr-only")
					  .text("Warning");
			var text = warningDiv.html() + " Node has been removed."				  		  
			warningDiv.html(text);
			//remove after 3 seconds
			setTimeout(removeAlertMsg, 3000);
		}
		else {
			//check if info about one of the to-be-removed node's children is displayed in the info field
			//if so, update its table
			// var children = getNodeChildren(node);
			var res = children.filter(function(c){
				return c.id === parseInt(d3.select(".node-label").attr("id"));
			});
			//TODO
			// update its table
			if(res[0]) {
				displayCPT(res[0]);
			}
		}
	}	

	// update
	refresh();
}