//svg width & height
// var width = 920,
	// height = 450,
var width = 0.7 * window.innerWidth,
	height = 450,
	r=20,
	pressedKey = -1;

var constants = {
	BACKSPACE: 8,
	ENTER: 13,
	DELETE:46
};

var svg = d3.select("#workspace")
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("id", "svg");

//TODO change default nodes and links
var nodes = [
	{id: 0, title: "project", x: 450, y: 100},
	{id: 1, title: "mark", x: 450, y: 250}
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
   .attr("refX", 30) //TODO change that
   .attr("markerWidth", 3)
   .attr("markerHeight", 3)
   .attr("orient", "auto")
   .append("path")
   .attr("d", "M0,-5L10,0L0,5")
   .attr("fill", "#0489B1") //TODO move to css

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
   .attr("fill", "#0489B1") //TODO move to css

//graph group, paths, circles
//TODO graph class temporary
var graph = svg.append("g").classed("test", true),
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
	editNodeValuesMode = false;

var setMode = function(mode){
	if (mode === "node") {
		if(!nodeMode) {
			defaultMode = false;
			nodeMode = true;
			connMode = false;
			editNodeValuesMode = false

			//TODO change
			d3.select("#nodeMode")
			  .classed("selected-button", true);
			d3.select("#connMode")
			  .classed("selected-button", false);
			d3.select("#editNode")
			  .classed("selected-button", false);
			return;
		}
	}
	else if (mode === "conn") {
		if(!connMode) {
			defaultMode = false;
			nodeMode = false;
			connMode = true;
			editNodeValuesMode = false

			//TODO change
			d3.select("#connMode")
			  .classed("selected-button", true);
			d3.select("#nodeMode")
			  .classed("selected-button", false);
			d3.select("#editNode")
			  .classed("selected-button", false);			  		  
			return;
		}
	}
	else if (mode === "editNode") {
		if(!editNodeValuesMode) {
			defaultMode = false;
			nodeMode = false;
			connMode = false;
			editNodeValuesMode = true;

			//TODO change
			d3.select("#editNode")
			  .classed("selected-button", true);
			d3.select("#connMode")
			  .classed("selected-button", false);
			d3.select("#nodeMode")
			  .classed("selected-button", false);			  
			return;
		}
	}
	defaultMode = true;
	nodeMode = false;
	connMode = false;
	editNodeValuesMode = false
	d3.select("#nodeMode")
	  .classed("selected-button", false);
	d3.select("#connMode")
	  .classed("selected-button", false);
	d3.select("#editNode")
	  .classed("selected-button", false);

	hideNodeInfo();	  
};

//handle drag behaviour
var dragmove = function(d) {
	//set the state to being dragged
	dragged = true;
	//handle when a line is being dragged to connect 2 nodes
	if(connMode) {
		dragline.attr("d", "M" + d.x + "," + d.y + "L" + d3.mouse(svg.node())[0] + "," + d3.mouse(svg.node())[1]);
	}
	//handle node dragging
	else {
		d.x += d3.event.dx;
		d.y += d3.event.dy;
		//disable dragging out of boundaries
		//TODO not working when called on the group
		d.x = Math.min(width-r, Math.max(d.x, r));
		d.y = Math.min(height-r, Math.max(d.y, r));
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
	d3.select(".test").attr("transform", "translate(" + d3.event.translate + ") scale (" + d3.event.scale + ")");
};

var zoom = d3.behavior.zoom()
			 .scaleExtent([0.5, 5])
			 // .on("zoom", function(d){
			 	// zoomBehavior(d);
			 // })
			 // .on("zoomstart", function(){
			 	//TODO cursor
			 // })
			 .on("zoom", zoomBehavior)
			 // .on("zoomend", function(){
			 	//TODO cursor
			 // });

var clearDisplayField = function() {
	d3.select("#control").html("");
}

//TODO code taken from
var multipleLinesText = function(text, d3elem) {
	var wordsLines = text.split(/\s+/g);
	var txtElem = d3elem.append("text")
						.attr("text-anchor", "middle")
						.style("font-size", "16px")
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

var editNodeText = function(d, d3Group){
	//TODO comment
	editNodeTextMode = true;

	var offsetX = 3,
		offsetY = 3;

	// var offsetX = d3Group.data()[0].x + 3,
		// offsetY = d3Group.data()[0].y + 3;

	//remove the current text
	//TODO change
	var backupTxt = d3Group.select("text");
	d3Group.select("text")
		   .remove();

	//TODO attach it to the svg rather than the element 
	// e.g. svg.append
	var textP = d3Group.append("foreignObject")
				   .attr("x", offsetX)
				   .attr("y", offsetY)
				   //TODO styling
				   .attr("width", r*6)
				   .attr("height", r*3)
				   //TODO make the id a constant					  
				   .attr("id", "nodeTxtInput")
				   .append("xhtml:textarea")
				   .attr("type", "text")
				   .attr("class", "form-control")
				   // .attr("style", "width:294px")
				   // .attr("contentEditable", true)
				   .text(d.title)
				   // .attr("value", d.title)
				   .on("keypress", function(){
				   	// d3.event.stopPropagation();
				      if(d3.event.keyCode === constants.ENTER) {
				   	 	 d3.event.preventDefault();
				   		 this.blur();
				   	  }
				   })
				   .on("blur", function(){
				   	 if(!isEmptyString(this.value)) {
 					   	d.title = this.value.trim();
					   	multipleLinesText(d.title, d3Group);
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
				//TODO test
				// document.getElementById("workspace").blur();
				//deselect node/edge if any are selected
				selectedNode = null;
				selectedPath = null;
				//edit node title
				editNodeText(mouseupNode, groupNode);
			}
			else if(editNodeValuesMode) {
				displayNodeInfo(mouseupNode);
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
			}
		}
	}
	
	mousedownNode = null;
	mouseupNode = null;
}

var numberNodeValues = function(num) {
	if(isNaN(num)) {
		//TODO error msg
		return
	}
	else if(num < 2 || num > 10) {
		//TODO error msg
		return
	}

	//count # of old input fields
	var progress = d3.selectAll("tr.nodeValueRow")[0].length;

	var nodeInfo = d3.select("table.nodeEditTbl");
	//add new input fields
	for(var i =progress+1; i<= num; i++) {
		var currRow = nodeInfo.append("tr")
							  .attr("class", "nodeValueRow");
		currRow.append("td")
			   .text("Value " + i);
		currRow.append("td")
			   .append("input")
			   .classed("nodeValue", true)
			   .attr("type", "text");
	}	
}

var updateNodeValues = function(node){
	//remove error text
	//TODO

	node.values = [];
	var cells = d3.selectAll("input.nodeValue")
				  .each(function(d, i) {
				  	console.log(this.value);
				  	//TODO check it is not empty etc
				  	node.values.push(this.value);
				  })

}

var displayNodeInfo = function(d) {
	clearDisplayField();
	var nodeInfo = d3.select("#control")
					 .append("table")
					 .classed("nodeEditTbl", true);

	//add node title
	nodeInfo.append("tr").html("<td> Node: </td> <td> " + d.title + " </td>")

	//add num of values
	var numOfValues = nodeInfo.append("tr");
	numOfValues.append("td").text("# values");
	numOfValues.append("td")
			   .append("input")
			   .attr("type", "number")
			   .attr("id", "numValues")
			   .attr("min", 2)
			   .attr("max", 10)
			   .attr("value", d.values.length)
			   .on("input", function() {
			   	  numberNodeValues(this.value);
			   })
			   .on("keydown", function() {
			   	 d3.event.preventDefault();
			   });


	//append options
	for(var i =1; i<= d.values.length; i++) {
		var currRow = nodeInfo.append("tr")
							  .attr("class", "nodeValueRow");
		currRow.append("td")
			   .text("Value " + i);
		currRow.append("td")
			   .append("input")
			   .classed("nodeValue", true)			   
			   .attr("type", "text")
			   .attr("value", d.values[i-1]);
	}

	d3.select("#control")
	  .append("button")
	  .classed("btn btn-default", true) //TODO style
	  .attr("id", "updateNodeValues")
	  .html("Update Values")
	  .on("click", function() {
	  	updateNodeValues(d);
	  });
}

//remove tables for changing node values if not in editNodeMode
var hideNodeInfo = function() {
	if(!editNodeValuesMode) {
		d3.selectAll(".nodeEditTbl").remove();
	}
}

var editNodeValues = function() {
	setMode("editNode");

	if(editNodeValuesMode) {
		//clear display
		clearDisplayField();
		d3.select("#control")
		  .append("text")
		  .classed("helpText", true) //TODO style it
		  .text("Select a node to edit.");
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

var html = "";
var createCPT = function(dataStr, idsList, level) {
	if (level === idsList.length-1) {
		var lastEl = idsList[level];

		//True case - data
		var trueCase = lastEl + "1";
		dataStr[trueCase] = 0.5;

		//False case - data
		var falseCase = lastEl + "0";
		dataStr[falseCase] = 1 - dataStr[trueCase];
	}
	else if(level < idsList.length-1) {
		//get the element from the front of the list
		var currEl = idsList[level];
		level++;

		//True case
		var trueCase = currEl + "1";
		dataStr[trueCase] = {};
		createCPT(dataStr[trueCase], idsList, level);			

		//False case		
		var falseCase = currEl + "0";
		dataStr[falseCase] = {};
		createCPT(dataStr[falseCase], idsList, level);
	}
	else {
		alert("Something unexpected has happened!")
	}
}

var displayCPT = function(cpt, list, level, chain) {
	//Base case
	if (level == list.length -1) {
		var lastEl = list[level];
		var valT = cpt[lastEl+'1'];
		var chainT = chain + lastEl + '1';
		// console.log(valT);
		html += '<td class="editable"> <input type="text" id="' + chainT + '" value="' + valT + '"></td> ';

		var valF = cpt[lastEl+'0'];
		var chainF = chain + lastEl + '0';
		// console.log(valF);
		//TODO make it readonly
		// html += '<td class="editable"> <input type="text" id="' + chainF + '"value="' + valF + '" readonly></td>';
		html += '<td class="editable"> <input type="text" id="' + chainF + '"value="' + valF + '"></td>';		
		d3.select(".cptTable")
		  .append("tr")
		  .classed("editableCptRow", true)
		  .html(html);

	}
	//Recursive case
	else if (level < list.length -1) {
		var currEl = list[level];
		level++;

		var tmpHtml = html;
		var tmpChain = chain;
		//True case
		chain += currEl + '1->';
		html += "<td>1</td>";
		var cptTrueCase = cpt[currEl + '1']
		displayCPT(cptTrueCase, list, level, chain);

		html = tmpHtml;
		chain = tmpChain;
		//False case
		chain += currEl + '0->';
		html += "<td>0</td>";
		var cptFalseCase = cpt[currEl + '0'];		
		displayCPT(cptFalseCase, list, level, chain);
	}
	//Error
	else {
		alert("Something unexpected happened!");
	}
}

var cptColumnNames = function(parents){
	var names = [];
	for (var i=0; i<parents.length; i++) {
		var filteredNode = nodes.filter(function(n) {
			return n.id === parents[i];
		})[0];
		names.push(filteredNode.title.charAt(0));
	}
	// console.log(names);

	if(names.length === 1) {
		var currName = "P(" + names[names.length-1];		
	}
	else if(names.length > 1) {
		var currName = "P(" + names[names.length-1] + "|";		
	}

	//go over all the elements except the last element - the current node
	// it defines the columns
	for (var i=0; i<names.length-1; i++) {
		html += '<td>' + names[i] + '</td>';
		currName += names[i] + ",";
	}

	//trim the last comma
	if(names.length > 1) {
		currName = currName.substring(0, currName.length-1)
	}

	//TODO change customisable
	html += '<td>' + currName + "=0)" +'</td>'
	html += '<td>' + currName + "=1)" +'</td>'
	d3.select(".cptTable").append("tr").html(html);
	html = "";
}

var isValidCPTEntry = function(num) {
	if(isNaN(num)) {
  		// return "NaNs are not acceptable.")
  		return false;
  	}
  	else if(num < 0 || num > 1) {
  		// alert("Enter a valid probability value between 0 and 1");
  		return false;
  	}
  	return true;
}

var validateUpdate = function() {
	var validEntries = true;
	var validRowSums = true;

	var rows = d3.selectAll(".editableCptRow")
				 .each(function(d, i) {
				 	var sumProb = 0;
				 	d3.select(this)
				 	  .selectAll("td.editable")
				 	  .selectAll("input")
				 	  .each(function(d, i) {
				 	  	if(isValidCPTEntry(this.value) && !isEmptyString(this.value)) {
				 	  		sumProb += parseFloat(this.value);
				 	  		//TODO add class instead
				 	  		d3.select(this)
					  		  .style("border-color","gray");
				 	  	}
				 	  	else {
				 	  		validEntries = false;
  					  		//TODO add class instead
					  		d3.select(this)
					  		  .style("border-color","red");
				 	  	}
				 	  });
				 	  console.log(sumProb);
				 	  if (sumProb !== 1) {
				 	  	validRowSums = false;
						//TODO change color of row if it does not sum to 1??			 	  	
				 	  }
				 });


	if (!validEntries) {
		// alert("Enter a valid probability value between 0 and 1.")
		d3.select("#control")
		  .insert("p", ".cptTable")
		  .classed("errorTxt", true) //TODO add styles
		  .text("Enter a valid probability value between 0 and 1.\n")
		  .style("color", "red");
	}

	if(!validRowSums) {
		d3.select("#control")
		  .insert("p", ".cptTable")
		  .classed("errorTxt", true) //TODO add styles
		  .text("Probabilities on one row must sum up to 1.\n")
		  .style("color", "red");		
	}

	return validEntries && validRowSums;
}
//update table values when edited
var updateTbl = function(){
	//clear previous error messages
	d3.select("#control")
	  .selectAll(".errorTxt")
	  .remove();

	var tblId = d3.select(".cptTable").attr("id");
	if(!tblId) {
		alert ("Table does not exist.")
	}

	var currCpt = nodes[tblId].tbl;
	if(!currCpt){
		alert("The CPT for this nodes cannot be accessed.");
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
					for (var p=0; p<path.length-1; p++) {
						nestedCpt = currCpt[path[i]];
					}
		 			nestedCpt[path[path.length-1]] = parseFloat(this.value);
				  });
}

//create table on added node
var createCPTInitialisation = function(d) {
	//get the parents for this node
	var parents = getNodeParents(d);
	parents.push(d.id);

	var cpt = {};
	if(d.tbl && uploaded) {
		cpt = d.tbl;
	}
	else {
		//create the internal cpt representation
		createCPT(cpt, parents, 0);		
		//assign the table as property of the current node
		d.tbl = cpt;
	}

	//TODO change that for multiple values
	d.values = ['1', '0'];	
}

var displayCPTInitialisation = function(d) {
	// console.log(d);
	//clear the current table
	clearDisplayField();
	html = "";
	//attach a new table
	d3.select("#control")
	  .append("table")
	  .attr("id", d.id)
	  .classed("cptTable", true);
	
	var parents = getNodeParents(d);
	console.log(parents);	
	parents.push(d.id);

	//CPT column names
	cptColumnNames(parents);
	var cpt = d.tbl;

	//display the cpt
	displayCPT(cpt, parents, 0, "");
	
	// Handling editing CPTs events
 	d3.select(".cptTable")
 	  .append("button")
 	  .attr("class", "btn btn-default")
 	  .attr("id", "tblUpdateBtn")
 	  .html("Update")
 	  .on("click", updateTbl);
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
    	   	//TODO go to darker color from here rgb bla bla
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
    		   	//TODO
    		   })
    		   .on("mouseout", function(d){
    		   	//TODO
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
    		   	  if(!editNodeTextMode) {
	    		   	  displayCPTInitialisation(d);
	    		  }
    		   })
    		   .call(drag);

    //add circle for each group
    circleGroup.append("circle")
    		   .attr("r", r)
    		   .call(function(d) {
    		   	  d.each(function(e) {
    		   	  	createCPTInitialisation(e);
    		   	  	// displayCPTInitialisation(e);
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
	//TODO test
	// if(zoomed) {
	// 	zoomed = false;
	// 	return;
	// }

	if(!nodeMode) {
		return;
	}
	else if(nodeMode && editNodeTextMode) {
		editNodeTextMode = false;
		return;
	}

	//TODO
	test = d3.mouse(svg.node());
	console.log(test);
	// var circleCenter = d3.mouse(svg.node()),
	var circleCenter = test,
		xPos = circleCenter[0],
		yPos = circleCenter[1],
		newNode = {id:++lastID, title:"New Node", x:xPos, y:yPos};

//	console.log(d3.mouse(this));
//	console.log(d3.mouse(svg.node()));
	nodes.push(newNode);
	refresh();
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
		createCPTInitialisation(targetNodes[tn]);
	}
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
					nodes.splice(nodes.indexOf(selectedNode),1);
					var incidentEgdes = removeIncidentEdges(selectedNode);
					//recalculate the cpts for all nodes that are target nodes for the selected node
					recalculateCPT(incidentEgdes, selectedNode);
				}
				else if(selectedPath) {
					edges.splice(edges.indexOf(selectedPath), 1);
					//recalculate the cpt of the target node of this edge
					recalculateCPT([selectedPath], selectedPath.source);
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
	var confirmed = true;
	if(isConfirm) {
		confirmed = window.confirm("Are you sure you want to delete the network?");
	}
	if(confirmed) {
		nodes = [];
		edges = [];
		refresh();
	}
}

var specifyDownloadName = function() {
//TODO
}

var downloadNetwork = function(){
	var compactEdges = []
	edges.forEach(function(e) {
		var compactEdge = {source: e.source.id, target:e.target.id};
		compactEdges.push(compactEdge);
	})
	var netObject = JSON.stringify({
		"nodes":nodes,
		"edges":edges
	});
	// console.log(netObject);
	var blob = new Blob([netObject], {type:"text/plain;charset=utf-8"});
	saveAs(blob, "bayesnet.json");
}

var maxNodeId = function(){
	return Math.max.apply(Math, nodes.map(function(n) {return n.id}));
}

var uploadNetwork = function(){
	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var fileReader = new window.FileReader();
		console.log(this);
		var uploadFile = this.files[0];

		fileReader.onload = function(){
			var txt = fileReader.result;
			try {
				var netObj = JSON.parse(txt);
				deleteNetwork(false);
				clearDisplayField();
				nodes = netObj.nodes;
				var rawEdges = netObj.edges;
				rawEdges.forEach(function(e, index){
					// console.log(e);
					// console.log(index);
					var src = nodes.filter(function(n) {
						return n.id === e.source.id;
					})[0];
					// console.log("source");
					// console.log(src);
					var tgt = nodes.filter(function(n) {
						return n.id === e.target.id; 
					})[0];	
					// console.log("target");
					// console.log(tgt);
					rawEdges[index] = {source: src, target:tgt}; 
				})
				edges = rawEdges;
				//find the max index in the nodes
				lastID = maxNodeId();
				//set the status to uploaded
				uploaded = true;
				refresh();
			}
			catch(err){
				alert("Error occured while parsing the file.")
			}
		}

		fileReader.readAsText(uploadFile);
	}
	else {
		alert("Your browser does not support this functionality.")
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
		for (var p in parents) {
			var currParent = nodes.filter(function(n) { return n.id === parents[p]});
			// console.log(nodes[parents[p]].sampled);
			if(currParent.sampled === false) {
				sampleNode(currParent, sample);
			}
		}
	}
	var value = doSampling(node, parents, sample);
	// console.log(value);
	var nodeId = node.id;
	sample[nodeId] = value;
	node.sampled = true;
}

var initialiseSampling = function() {
	//set all nodes state to not sampled
	for (var n in nodes) {
		nodes[n].sampled = false;
	}
	return true;
}

var singleSample = function() {
	//set nodes status to not sampled
	initialiseSampling();
	var currSample = {};
	for (var n in nodes) {
		if(!nodes[n].sampled) {
			sampleNode(nodes[n], currSample);
		}
	}
	return currSample;
}

var sampleTblColumnNames = function(){
	var names = [];
	var columns = ""

	for(var n in nodes) {
		names.push(nodes[n].title);
	}

	for (var name in names) {
		columns += '<td>' + names[name] + '</td>';
	}

	d3.select(".sampleTbl")
	  .append("tr")
	  .html(columns);
}

var formatSamplesDownload = function(samples) {
	var samplesObject = {}

	//node titles as properties
	for (var n in nodes) {
		samplesObject[nodes[n].title] = [];
	}

	//for every node put each sample for it in an array
	for (var s in samples) {
		for (var v in  samples[s]) {
			// console.log(nodes[v].title);
			// console.log(samples[s][v]);
			samplesObject[nodes[v].title].push(samples[s][v]);
		}
	}

	// console.log(samplesObject);
	return samplesObject;
}

var downloadSamples = function(samples) {
	//format the data to be downloaded
	var sampleData = formatSamplesDownload(samples);

	var sampleObject = JSON.stringify({
		"samples":sampleData
	});
	// console.log(netObject);
	var blob = new Blob([sampleObject], {type:"text/plain;charset=utf-8"});
	saveAs(blob, "sample_bayes.json");

}

var displaySamples = function(samples) {
	//clear the display space
	clearDisplayField();

	//download button
	d3.select("#control")
	  .append("button")
	  .attr("class", "btn btn-default")
	  .attr("id", "sampleDownloadBtn")
	  .html("Download Samples")
	  .on("click", function() {
	  	downloadSamples(samples);
	  });

	//apend table for the results
	d3.select("#control")
	  .append("table")
	  .attr("class", "sampleTbl");

	//append the columns names
	sampleTblColumnNames();

	var accumulator = "";
	for (var s in samples) {
		for (var val in samples[s]) {
			accumulator += '<td>' + samples[s][val] + '</td>';
		}
		d3.select("#control").append("tr").html(accumulator);
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
		alert("Nodes \"" + titles + "\" need their CPTs initialised.");
		return false;
	}
	return true; 
}

var ancestralSampling = function() {
	//remove previous error messages
	d3.selectAll(".errorTxt").remove();

	//get the number of samples to be made
	var noOfSamples = parseInt(d3.select("#numSamplesInput").node().value);
	if(isNaN(noOfSamples)) {
		d3.select("#control")
		  .insert("p", "#numSamplesInput")
		  .text("Please enter a valid number of samples.")
		  .classed("errorTxt", true)
		  .style("color", "red"); //TODO

		return;
	}

	var success = checkExistingCpts();
	if (!success) {
		return;
	}	

	samples = [];
	for (var i=0; i< noOfSamples; i++) {
		var sample = singleSample();
		console.log(sample);
		samples.push(sample);
	}

	console.log(samples);

	displaySamples(samples);
}

var samplingSettings = function(){
	d3.select("#control")
	  .html("");

	d3.select("#control")
	  .append("input")
	  .attr("id", "numSamplesInput")
	  .attr("type", "number")
	  .attr("min", "1");
	d3.select("#control")
	  .append("button")
	  .attr("class", "btn btn-default")
	  .attr("id", "runSamplingBtn")
	  .html("Run")
	  .on("click", ancestralSampling);
}

svg.on("mousedown", svgMouseDown)
   .on("mouseup", svgMouseUp)
   .on("mouseover", function() {
	   focused = true;
   })
   .on("mouseout", function() {
   	   focused = false;
   })
   // .call(zoom); //TODO uncomment

svg.on("dblclick.zoom", null);

d3.select(window)
  .on("keydown", keyDown)
  .on("keyup", keyUp);

//TODO uncomment
// window.onbeforeunload = function() {
// 	return "Any progress you have made is not going to be saved.";
// }

window.onresize = function() {
	var updatedSvgWidth = 0.7 * window.innerWidth,
		updatedControlWidth = 0.2 * window.innerWidth;

	svg.attr("width", updatedSvgWidth);
}

//TODO temporary
d3.select("#nodeMode")
  .on("click", function(){
  	setMode("node");
  });
d3.select("#connMode")
  .on("click", function(){
  	setMode("conn");
  })
d3.select("#editNode")
  .on("click", editNodeValues);
d3.select("#downloadNet")
  .on("click", downloadNetwork);
d3.select("#deleteNet")
  .on("click", function(){
  	deleteNetwork(true);
  });
d3.select("#uploadNet")
  .on("click", function(){
  	document.getElementById("hiddenUpload").click()
  });
d3.select("#hiddenUpload")
  .on("change", uploadNetwork);
d3.select("#sampleNet")
  .on("click", samplingSettings);
	
refresh();