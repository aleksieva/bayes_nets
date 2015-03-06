//svg width & height
var width = 0.7 * window.innerWidth,
	height = 450,
	radius=20,
	pressedKey = -1;

var constants = {
	BACKSPACE: 8,
	ENTER: 13,
	DELETE:46
};

var svg = d3.select("#workspace")
			.append("svg")
			.attr("width", "100%")
			.attr("height", height)
			// .attr("width", width)
			// .attr("height", height)
			.attr("id", "svg");

var control = d3.select("#control");

//TODO change default nodes and links
var nodes = [
	{id: 0, title: "Smoker", x: 450, y: 100, values:['1','0']},
	{id: 1, title: "Bronchitis", x: 450, y: 250, values:['1', '0']}
	],
	edges = [
		{source: nodes[0], target:nodes[1]}
	],
	lastID=1;

//arrow markers
//TODO code used from
svg.append("defs")
   .append("marker")
   .attr("id", "arrow")
   .attr("viewBox", "0 -5 10 10")
   .attr("refX", 21)
   .attr("markerWidth", 3)
   .attr("markerHeight", 3)
   .attr("orient", "auto")
   .append("path")
   .attr("d", "M0,-5L10,0L0,5")
   .attr("class", "arrow")

svg.append("defs")
   .append("marker")
   .attr("id", "dragline-arrow")
   .attr("viewBox", "0 -5 10 10")
   .attr("refX", 6)
   .attr("markerWidth", 3)
   .attr("markerHeight", 3)
   .attr("orient", "auto")
   .append("path")
   .attr("d", "M0,-5L10,0L0,5")
   .attr("class", "arrow");

//graph group, paths, circles
var graph = svg.append("g"),
	paths = graph.append("g").selectAll("path"),
    circles = graph.append("g").selectAll("g");

//dragline
var dragline = graph.append("path")
					.attr("class", "conn hidden dragline")
				 	.attr("d", "M0,0L0,0")
				 	.style("marker-end", "url(#dragline-arrow)");

//mouse event variables
var selectedNode = null,
	selectedPath = null,
	mousedownNode = null;

//status states
var dragged = false,
	zoomed = false,
	focused = false,
	uploaded = false;

//work mode
var defaultMode = true,
	nodeMode = false,
	connMode = false,
	editNodeTextMode = false,
	editNodeMode = false,
	sampleMode = false;

var setMode = function(mode){
	//clear the display field
	clearDisplayField();

	if (mode === "node") {
		if(!nodeMode) {
			defaultMode = false;
			nodeMode = true;
			connMode = false;
			editNodeMode = false;
			sampleMode = false;

			//indicate the mode as selected
			d3.select("#node-mode")
			  .classed("selected", true);
			d3.select("#conn-mode")
			  .classed("selected", false);
			d3.select("#edit-mode")
			  .classed("selected", false);
			d3.select("#sample-net")
			  .classed("selected", false);			  
			return;
		}
	}
	else if (mode === "conn") {
		if(!connMode) {
			defaultMode = false;
			nodeMode = false;
			connMode = true;
			editNodeMode = false
			sampleMode = false;

			//indicate the mode as selected
			d3.select("#conn-mode")
			  .classed("selected", true);
			d3.select("#node-mode")
			  .classed("selected", false);
			d3.select("#edit-mode")
			  .classed("selected", false);
			d3.select("#sample-net")
			  .classed("selected", false);				  			  		  
			return;
		}
	}
	else if (mode === "edit") {
		if(!editNodeMode) {
			defaultMode = false;
			nodeMode = false;
			connMode = false;
			editNodeMode = true;
			sampleMode = false;

			//indicate the mode as selected
			d3.select("#edit-mode")
			  .classed("selected", true);
			d3.select("#conn-mode")
			  .classed("selected", false);
			d3.select("#node-mode")
			  .classed("selected", false);
			d3.select("#sample-net")
			  .classed("selected", false);				  			  
			return;
		}
	}
	else if (mode === "sample") {
		if(!sampleMode) {
			sampleMode = true;
			nodeMode = false;
			connMode = false;
			editNodeMode = false;
			defaultMode = false;
			d3.select("#node-mode")
			  .classed("selected", false);
			d3.select("#conn-mode")
			  .classed("selected", false);
			d3.select("#edit-mode")
			  .classed("selected", false);
			d3.select("#sample-net")
			  .classed("selected", true);	
			return;
		}
	}
	defaultMode = true;
	nodeMode = false;
	connMode = false;
	editNodeMode = false;
	sampleMode = false;
	d3.select("#node-mode")
	  .classed("selected", false);
	d3.select("#conn-mode")
	  .classed("selected", false);
	d3.select("#edit-mode")
	  .classed("selected", false);
	d3.select("#sample-net")
	  .classed("selected", false);		  
	
};

//handle drag behaviour
var dragmove = function(d) {
	//set the state to being dragged
	dragged = true;
	//handle when a line is being dragged to connect 2 nodes
	if(connMode) {
		dragline.attr("d", "M" + d.x + "," + d.y + "L" + d3.mouse(graph.node())[0] + "," + d3.mouse(graph.node())[1]);
	}
	//handle node dragging
	else {
		d.x += d3.event.dx;
		d.y += d3.event.dy;
		//disable dragging out of boundaries
		// d.x = Math.min(width-radius, Math.max(d.x, radius));
		// d.y = Math.min(height-radius, Math.max(d.y, radius));
		refresh();		
	}
};

//TODO maybe change cursor dragstart && dragend?
var drag = d3.behavior.drag()
			 .origin(function(d){
			 	return {x: d.x, y:d.y};
			 })
			 .on("dragstart", function(){
			 	d3.event.sourceEvent.stopPropagation();
			 })
			 .on("drag", dragmove);

//handle zoom behaviour
var zoomBehavior = function(d){
	// zoomed = true;

	graph.attr("transform", "translate(" + d3.event.translate + ") scale (" + d3.event.scale + ")");
};

var zoom = d3.behavior.zoom()
			 .scaleExtent([0.5, 2])
			 // .on("zoomstart", function(){
			 	//TODO cursor
			 // })
			 .on("zoom", zoomBehavior)
			 .on("zoomend", function(){
			 	//TODO cursor
			 	//recalculate the zoom scale
				d3.select("#zoom-scale")
				  .text("Zoom Scale: " + zoom.scale().toFixed(2));			 	
			 });

var clearDisplayField = function() {
	control.html("");
}

//TODO code taken from
var multipleLinesText = function(text, d3elem) {
	var wordsLines = text.split(/\s+/g);
	var txtElem = d3elem.append("text")
						.attr("class", "node-title")
						.attr("text-anchor", "middle")
						//TODO change
			            .attr("dy", "-" + (wordsLines.length-1)*7.5);

	for (var i=0; i<wordsLines.length; i++) {
		var tspanElem = txtElem.append("tspan")
							   .text(wordsLines[i]);
		if (i > 0) {
			tspanElem.attr("x", 0).attr("dy", 15);
		}
	}

}

var isEmptyString = function(text) {
	return text.length === 0 || /^\s*$/.test(text);
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

var editNodeText = function(d, d3Group){
	editNodeTextMode = true;

	var offsetX = 3,
		offsetY = 3;

	//remove the current text
	var backupTxt = d3Group.select("text");
	d3Group.select("text")
		   .remove();

	var textP = d3Group.append("foreignObject")
				   .attr("x", offsetX)
				   .attr("y", offsetY)
				   .attr("width", radius*6)
				   .attr("height", radius*3)
				   .attr("id", "nodeTxtInput")
				   .append("xhtml:textarea")
				   .attr("type", "text")
				   .attr("class", "form-control")
				   .text(d.title)
				   .on("keypress", function(){
				      if(d3.event.keyCode === constants.ENTER) {
				   	 	 d3.event.preventDefault();
				   		 this.blur();
				   	  }
				   })
				   .on("blur", function(){
				   	 if(!isEmptyString(this.value)) {
 					   	d.title = this.value.trim();
 					   	//capitalize every node title
 					   	d.title = d.title.charAt(0).toUpperCase() + d.title.slice(1);
 					   	//check for duplicates
 					   	d.title = duplicateNodeTitles(d.title, d);
					   	multipleLinesText(d.title, d3Group);
					   	//update edit info if this node has been edited
					   	if(editNodeMode) {
					   		var editedNode = d3.select("h3.node-label");
					   		//check if any node info has been displayed
					   		if(editedNode[0][0]) {
						   		var id = editedNode.attr("id");
						   		if(parseInt(id) === d.id) {
						   			editedNode.text(d.title);
						   		}
						   	}
					   	}
				   	 }
				   	 else {
				   	 	multipleLinesText(backupTxt.text(), d3Group);
				   	 }
				     d3.select(document.getElementById("nodeTxtInput")).remove();
				     editNodeTextMode = false;
				     focused = true;
				   })
				   .on("mouseover", function(){
				   	  //enable deleting with backspace as long as it is not on the svg
				   	  d3.event.stopPropagation();
				   	  focused = false;
				   })
				   .on("mouseout", function(){
				   	  focused = true;
				   })
				   .on("mousedown", function(){
				   	  d3.event.stopPropagation();
				   });

	textP.node().focus();

}

var nodeMouseDown = function(d){
	mousedownNode = d;

	if(connMode) {
		//reposition the dragline to the center of the node
		dragline.classed("hidden", false)
				.attr("d", "M" + d.x + "," + d.y + "L" + d.x + "," + d.y);
	}
}

var createNewEdge = function(sourceNode, targetNode) {
	//create a new edge
	var newEdge = {source:sourceNode, target:targetNode};
	var duplicates = edges.filter(function(e){
		//check if there is an edge in the opposite direction
		//i.e an edge with reverse target and source to the new edges
		//if so -> remove it
		if(newEdge.target === e.source && newEdge.source === e.target) {
			edges.splice(edges.indexOf(e),1);
			//recalculate this node cpt as this edge has been deleted
			recalculateCPT([e], e.source);
		}
		//check if there is identical edge
		return newEdge.source === e.source && newEdge.target === e.target;
	})
	//add the new edge to the set of edges only if there are no identical edges
	if(!duplicates[0]) {
		edges.push(newEdge);
		recalculateCPT([newEdge], newEdge.source);
		refresh();
	}
}

var nodeMouseUp = function(d, groupNode){

	// console.log(d3.select(d));
	// console.log(groupNode);
	//check if mousedownNode is set
	if(!mousedownNode)
		return;

	dragline.classed("hidden", true);

	//the node that the mouse is located on on mouseup
	var mouseupNode = d;
	//if the mouse has moved to a different node and connection mode is on
	//add a new edge between these 2 nodes
	if(mousedownNode !== mouseupNode) {
		if(connMode) {
			createNewEdge(mousedownNode, mouseupNode);
			dragged =false;
		}
	}
	//the node on mouse up and on mouse down is the same
	// 4 possible cases when this could happen
	// 1. node has been dragged
	// 2. node has been shift clicked to edit its text
	// 3. editNode mode is on and node has been selected for editing
	// 4. select node
	else {
		if(dragged) {
			dragged = false;
		}
		else {
			if(d3.event.shiftKey) {
				//deselect node/edge if any are selected
				selectedNode = null;
				selectedPath = null;
				refresh();
				//edit node title
				editNodeText(mouseupNode, groupNode);
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

				//display the node info if in editNodeMode && a node has been selected
				if(editNodeMode && selectedNode) {
					displayNodeInfo(selectedNode);
				}
				else {
					editNodeEnter();
				}
			}
		}
	}
	
	mousedownNode = null;
	mouseupNode = null;
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
		//TODO alert?
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
	  })
	
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
			var successDiv = control.insert("div", "#edit-div-tbl")
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
			var errorDiv = control.insert("div", "#edit-div-tbl")
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
		var errorDiv = control.insert("div", "#edit-div-tbl")
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
}

var displayNodeValues = function(d) {	
	d3.select("#div-update-btn").html("");
	
	var nodeInfo = d3.select("#div-update-btn")
					 .append("div")
					 .attr("class", "table-responsive div-table")
					 .attr("id", "edit-div-tbl")	
					 .append("table")
					 .attr("class", "table table-bayes node-edit-tbl");

	//add num of values
	var numOfValues = nodeInfo.append("tr");
	numOfValues.append("th").text("# values");
	numOfValues.append("th")
			   .attr("class", "editable")
			   .append("input")
			   .attr("type", "number")
			   .attr("id", "numValues")
			   .attr("min", 2)
			   .attr("max", 10)
			   .attr("value", d.values.length)
			   .on("input", function() {
			   	  appendNodeValues(this.value);
			   })
			   .on("keydown", function() {
			   	 d3.event.preventDefault();
			   });

	// append options
	for(var i =1; i<= d.values.length; i++) {
		var currRow = nodeInfo.append("tr")
							  .attr("class", "nodeValueRow");
		currRow.append("td")
			   .text("Value " + i);
		currRow.append("td")
			   .attr("class", "editable")
			   .append("input")
			   .classed("nodeValue", true)			   
			   .attr("type", "text")
			   .attr("value", d.values[i-1])
			   .on("blur", function() {
			   	 // console.log("lose focus");
			   	 console.log(this);
			   	 //TODO
			   	 //Update value
			   	 updateSingleValue(this, d);
			   });
	}

	d3.select("#div-update-btn")
	  .append("button")
	  .classed("btn btn-default btn-bayes", true)
	  .attr("id", "update-node-values")
	  .html("Update Values")
	  .on("click", function() {
	   	updateNodeValues(d);
	  });
}

var displayHelp = function() {
	clearDisplayField();
	// setMode("");
	//help page
	control.append("p")
		   .attr("class", "instructions-text text-justified")
		   .html("<b> Add a Node: </b> Select the \'Add Node\' mode and click on the work field.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<b> Edit Node Name: </b> Shift-click on the node.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<b> Edit Node: </b> Select the \'Edit Node \' mode and click on the node to edit.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<b> Delete Node: </b> In \'Edit Node \' mode for the node you want to delete - click \'Delete Node \' button or press Backspace");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<b> Add Link: </b> In \'Add Link \' mode drag a line from one node to another.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<b> Reverse Link: </b>");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<b> Delete Link: </b>");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<b> Sample Data: </b>");			   		   	   		   		   		   
}
//display instructions for edit node mode
var editNodeEnter = function() {
	if(editNodeMode) {
		//clear display
		clearDisplayField();
		//remove select from node && path
		selectedNode = null;
		selectedPath = null;
		refresh();

		//instructions
		control.append("p")
			   .classed("help-text", true)
			   .text("Select a node to edit.");
	}
}


//display instructions for add node mode
var addNodeEnter = function() {
	if(nodeMode) {
		//clear display
		clearDisplayField();

		//instructions
		control.append("p")
			   .classed("help-text", true)
			   .text("Click on the work field to add a new node.");		
	}
}

//display instructions for add node mode
var addLinkEnter = function() {
	if(connMode) {
		//clear display
		clearDisplayField();

		//instructions
		control.append("p")
			   .classed("help-text", true)
			   .text("Drag from one node to another to place a link between them.");		
	}
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
		var errorDiv = control.insert("div", "#edit-div-tbl")
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
		var errorDiv = control.insert("div", "#edit-div-tbl")
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

	//true false values
    if(_.isEqual(node.values.sort(), ["0", "1"])) {
    	allCells.forEach(function(c) {
    		if(c !== cell.node()) {
    			c.value = 1 - parseFloat(cell.node().value);
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

	parents.forEach(function(parent) {
		var filteredNode = nodes.filter(function(n) {
			return n.id === parent;
		})[0];
		names.push(filteredNode.title.charAt(0).toUpperCase());
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
	  .on("blur", function() {
	  	updateCell(d3.select(this), d);
	  })
	
	// Handling editing CPTs events
 	d3.select("#div-update-btn")
 	// d3.select(".cpt-table")
 	  .append("button")
 	  .attr("class", "btn btn-default btn-bayes")
 	  .attr("id", "cpt-update-btn")
 	  .html("Update CPT")
 	  .on("click", updateTbl);
}

var displayNodeOption = function(option, node) {
	if(option === "cpt") {
		displayCPT(node);
	}
	else if(option === "val") {
		displayNodeValues(node);
	}
}

var displayNodeInfo = function(node) {
	clearDisplayField();

	//append node title
	control.append("h3")
		   .text(node.title + ":")
		   .classed("node-label", true)
		   .attr("id", node.id);

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
					 });

	select.append("option")
		  .attr("value", "cpt")
		  .attr("selected", true)		  
		  .text("CPT table");
	select.append("option")
		  .attr("value", "val")
		  .text("Node Values");

	control.append("hr");

	//display the relevant data
	var infoDiv = control.append("div")
						 .attr("id", "div-update-btn");
	
	var selOption = d3.select("#node-options").node().options[d3.select("#node-options").node().selectedIndex].value;
	displayNodeOption(selOption, node);
	control.append("hr");

	// delete button
	control.append("p")
		   // .attr("for", "delete-node-btn")
		   .attr("class", "label-text")
		   .text("Delete the node:" );

	control.append("button")
		   .attr("class", "btn btn-default btn-bayes")
		   .attr("id", "delete-node-btn")
		   .html("Delete Node")
		   .on("click", function() {
		   	//delete this node
		   	deleteNode(node);
		   })

}

var refresh = function(){
	//data for the paths
	paths = paths.data(edges);

	//update existing edges
	paths.classed("selected", function(d){
		    return d === selectedPath;
		 })
		//If a node has been dragged, update the associated paths' coordinates
		 .attr("d", function(d){
		 	return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
		 })

	//add new edges
	paths.enter()
		 .append("path")
		 .attr("class", "conn")
		 .classed("selected", function(d) {
		 	return d === selectedPath;
		 })
		 .style("marker-end", "url(#arrow)")
		 .attr("d", function(d) {
		 	return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
		 })
		 .on("mousedown", function(d){ 
		 	d3.event.stopPropagation();

		    //select/deselect the path
		 	if(d === selectedPath) {
		 		selectedPath = null;
		 	}
		 	else {
		 		selectedPath = d;
		 	}

		 	selectedNode = null;
		 	refresh();
		 });

    //remove old paths
    paths.exit().remove();

    //data for the circles
    circles = circles.data(nodes, function(d) {
    	return d.id;
    });

    //update nodes
    circles.classed("selected", function(d){
    	   	 return d === selectedNode;
    	   })
    	   .attr("transform", function(d){
    	   	 return "translate(" + d.x + "," + d.y + ")";
    	   })

    //new nodes
    var circleGroup = circles.enter().append("g");

    circleGroup.attr("class", "node")
    		   .attr("transform", function(d){
    			  return "translate(" + d.x + "," + d.y + ")";
    		   })
    		   .on("mouseover", function(d){
    		   	//enlarge the circle
    		   	 d3.select(this)
    		   	   .select("circle")
    		   	   .attr("r", radius + 2);
    		   })
    		   .on("mouseout", function(d){
    		   	//shrink the circle
    		   	 d3.select(this)
    		   	   .select("circle")
    		   	   .attr("r", radius- 2);
    		   })
			   .on("mousedown", function(d){
    		      d3.event.stopPropagation();
    		      nodeMouseDown(d);
    		   })
			   .on("mouseup", function(d){
			   	  //need to have propagation for dragging
			   	  nodeMouseUp(d, d3.select(this));
    		   })
    		   .on("dblclick", function(d){
    		   	  if(!editNodeTextMode && editNodeMode) {
	    		   	  displayNodeOption('cpt', d);
	    		  }
    		   })
    		   .call(drag);

    //add circle for each group
    circleGroup.append("circle")
    		   .attr("r", radius)
    		   .call(function(d) {
    		   	  d.each(function(e) {
    		   	  	createCPT(e);
    		   	  })
    		   	  uploaded = false;
    		   });

    //add titles
    circleGroup.each(function(c) {
    	multipleLinesText(c.title, d3.select(this));
    })

    //remove old circles
    circles.exit().remove();		   
};

var svgMouseDown = function(){
	if(!nodeMode) {
		return;
	}
	else if(nodeMode && editNodeTextMode) {
		editNodeTextMode = false;
		return;
	}

	//add new node
	var circleCenter = d3.mouse(graph.node()),
		xPos = circleCenter[0],
		yPos = circleCenter[1],
		newNode = {id:++lastID, title:"New Node", x:xPos, y:yPos, values:['1', '0']};


	nodes.push(newNode);
	newNode.title = duplicateNodeTitles(newNode.title, newNode);
	refresh();
	//change?
	selectedNode = newNode;
	refresh();

	//when a new node is added get out of add node mode and go to edit mode for this node
	setMode("edit")
	displayNodeInfo(newNode);
};

var svgMouseUp = function(){
	if(mousedownNode && connMode) {
		dragline.classed("hidden", true);
	}
};

//TODO code taken from
var removeIncidentEdges = function(node) {
	var edgesToDelete = edges.filter(function(e) {
		return (e.source === node || e.target === node);
	});

	edgesToDelete.map(function(e) {
		edges.splice(edges.indexOf(e), 1);
	});

	return edgesToDelete;
};

var recalculateCPT = function(edgesArray, sourceNode) {
	var targetNodes = [];
	console.log(edgesArray);
	console.log(sourceNode);
	for (var edge in edgesArray) {
		if (edgesArray[edge].source === sourceNode) {
			targetNodes.push(edgesArray[edge].target);
		}
	}
	console.log(targetNodes);
	for (var tn in targetNodes) {
		createCPT(targetNodes[tn]);
	}
}

var deleteNode = function(node) {
	// var confirm = false;
	// confirm = window.confirm("Are you sure you want to delete this node?");
	// if(confirm) {	
			nodes.splice(nodes.indexOf(node),1);
			var incidentEgdes = removeIncidentEdges(node);
			//recalculate the cpts for all nodes that are target nodes for the selected node
			recalculateCPT(incidentEgdes, node);

			//if node info is displayed remove it
			if(editNodeMode) {
				editNodeEnter();
			}
	// }
}

var deleteEdge = function(path) {
	// var confirm = false;
	// confirm = window.confirm("Are you sure you want to delete this link?");
	// if(confirm) {
		edges.splice(edges.indexOf(path), 1);
		//recalculate the cpt of the target node of this edge
		recalculateCPT([path], path.source);		
	// }
}

var keyDown = function() {
	if(pressedKey !== -1)
	  return;
	pressedKey = d3.event.keyCode;

	switch(pressedKey) {
		case constants.BACKSPACE:
		case constants.DELETE:
			if(focused) {
				//prevent default only for these keys
				d3.event.preventDefault();
				if(selectedNode) {
					deleteNode(selectedNode);
				}
				else if(selectedPath) {
					deleteEdge(selectedPath);
				}
      			selectedNode = null;
      			selectedPath = null;
      			refresh();
			}

      break;
	}
};

var keyUp = function() {
	//reset
	pressedKey = -1;
};

var deleteNetwork = function(isConfirm) {
	if(isConfirm) {
		bootbox.confirm("Are you sure you want to delete the network?", function(result) {
	  		console.log(result);
	  		if(result) {
				nodes = [];
				edges = [];
				refresh();	  			
	  		}
		});		
	}
	else {
		nodes = [];
		edges = [];
		refresh();		
	}
}

//TODO code taken from
var specifyDownloadName = function(ext, samples) {
	var filename = "";
	bootbox.dialog({
	  message: "<input type='text' id='filename' class='alert-input'></input> " + ext,
	  title: "Specify file name:",
	  value: "bayesnet",
	  buttons: {
	    main: {
	      label: "Download",
	      className: "btn-bayes",
	      callback: function() {
	        filename = $('#filename').val();
	        if(ext === ".json") {
		        downloadNetwork(filename);	
	        }
	        else if(ext === ".csv") {
	        	downloadSamples(filename, samples);
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

var maxNodeId = function(){
	return Math.max.apply(Math, nodes.map(function(n) {return n.id}));
}

//TODO code taken from
var uploadNetwork = function(){
	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var fileReader = new window.FileReader();
		var uploadFile = this.files[0];

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
				setMode("");
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
		document.getElementById("hiddenUpload").value = "";
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
	for (var val in cpt) {
		probabValues.push(parseFloat(cpt[val]));
	}
	// console.log(probabValues);

	//go through the probability ranges for each possible value 
	//and check if the random number is in one of this ranges
	//return the value associated with this range 
	var numPossibleValues = node.values.length;
	var sum = 0.0;
	for(var i=0; i<numPossibleValues; i++) {
		var currProb = probabValues[i];
		// console.log(currProb);
		var lowerBound = sum;
		sum += currProb
		var upperBound = sum;
		if (randVal >= lowerBound && randVal < upperBound) {
			return node.values[i]
		}
	}	
}

var sampleNode = function(node, sample) {
	// console.log("Node");
	// console.log(node);
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
	console.log(fixed);
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
	// saveAs(blob, "sample_bayes.csv");

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
		   	specifyDownloadName(".csv", samples);
		   	// downloadSamples(samples);
		   });
	//reset btn
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .html("Reset")
		   .on("click", function(){
		   	samplingSettings();
		   });			   

	control.append("hr");

	//apend table for the results
	// var sampleTbl;
	// if(noSample <= 10) {
	// 	sampleTbl = control.append("div");
	// }
	// else {
	// 	sampleTbl = d3.select("#long-sample").append("div");
	// }
	// sampleTbl.attr("class", "table-responsive sample-table")
	// 		 .append("table")
	// 		 .attr("class", "table table-bayes sample-tbl");	
	var sampleTbl = control.append("div")
						   .attr("class", "table-responsive sample-table")
						   .append("table")
	  	   				   .attr("class", "table table-bayes sample-tbl");


	//append the columns names
	sampleTblColumnNames();

	var sampleTblBody = sampleTbl.append("tbody");
	var accumulator = "";
	for (var s in samples) {
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

var ancestralSampling = function(fSample) {
	//remove previous error messages
	d3.selectAll(".alert-text").remove();

	//get the number of samples to be made
	var noOfSamples = parseInt(d3.select("#num-samples-input").node().value);
	if(isNaN(noOfSamples)) {
		//error message
		var errorDiv = control.insert("div", "#num-samples-input")
							   .attr("class", "alert-text alert alert-danger");
		errorDiv.append("span")
				.attr("class", "glyphicon glyphicon-exclamation-sign")
				.attr("aria-hidden", "true");
		errorDiv.append("span")
				.attr("class", "sr-only")
				.text("Error");
		var text = errorDiv.html() + " Enter a valid number of samples.";
		errorDiv.html(text);			
		return;
	}

	var success = checkExistingCpts();
	if (!success) {
		return;
	}

	var samples = [];
	for (var i=0; i< noOfSamples; i++) {
		// console.log(fSample);
		var sample = singleSample(fSample);
		samples.push(sample);
	}

	//get nodes status back to false
	setSamplingStatus();
	//display the samples
	displaySamples(samples, noOfSamples, fSample);
}

var samplingSettings = function(){
	if(sampleMode) {
		clearDisplayField();

		//keep the fixed values here
		var fixedSamples = {};
		nodes.forEach(function(node){
			fixedSamples[node.id] = "none";
		})

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
			   .attr("class", "btn btn-default btn-bayes-short")
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
								 	console.log(fixedSamples);
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
		var fileReader = new window.FileReader();
		var uploadFile = this.files[0];
		// console.log(uploadFile);
		fileReader.readAsText(uploadFile);		
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

svg.on("mousedown", svgMouseDown)
   .on("mouseup", svgMouseUp)
   .on("mouseover", function() {
	   focused = true;
   })
   .on("mouseout", function() {
   	   focused = false;
   })
   .call(zoom); 


svg.on("dblclick.zoom", null);

d3.select(window)
  .on("keydown", keyDown)
  .on("keyup", keyUp);

//TODO uncomment
// window.onbeforeunload = function() {
// 	return "Any progress you have made is not going to be saved.";
// }

// window.onresize = function() {
// 	var updatedSvgWidth = 0.7 * window.innerWidth,
// 		updatedControlWidth = 0.2 * window.innerWidth;

// 	svg.attr("width", updatedSvgWidth);
// }

//button controls
d3.select("#node-mode")
  .on("click", function(){
  	setMode("node");
  	addNodeEnter();
  });
d3.select("#conn-mode")
  .on("click", function(){
  	setMode("conn");
  	addLinkEnter();
  })
d3.select("#edit-mode")
  .on("click", function() {
  	setMode("edit");
  	editNodeEnter();
  });
// d3.select("#downloadNet")
//   .on("click", downloadNetwork); 
d3.select("#downloadNet")
  .on("click", function() {
  	specifyDownloadName(".json")
  	// downloadNetwork();
  });
d3.select("#deleteNet")
  .on("click", function(){
  	deleteNetwork(true);
  });
d3.select("#uploadNet")
  .on("click", function(){
  	document.getElementById("hiddenUpload").click();
  });
d3.select("#hiddenUpload")
  .on("change", uploadNetwork);
d3.select("#sample-net")
  .on("click", function() {
  	setMode("sample");
  	samplingSettings();
  });
d3.select("#uploadSample")
  .on("click", function(){
  	document.getElementById("hiddenUpload2").click();
  });
d3.select("#hiddenUpload2")
  .on("change", uploadSample);
d3.select("#help")
  .on("click", function(){
  	//display instructions
  	displayHelp();
  });
d3.select("about")
  .on("click", function(){
  	//TODO
  });

//Initialise
//render  
refresh();
//display instructions
displayHelp();
//display zoom scale
d3.select("#workspace")
  .append("p")
  .attr("id", "zoom-scale")
  .attr("class", "pull-right zoom-text")
  .text("Zoom Scale: " + zoom.scale().toFixed(2));  
