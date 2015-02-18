//svg width & height
var width = 920,
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

//network states
//TODO do we need these?
var dragged = false,
	zoomed = false;

//work mode
var defaultMode = true,
	nodeMode = false,
	connMode = false,
	editNodeTextMode = false;

var setMode = function(mode){
	if (mode === "node") {
		if(!nodeMode) {
			defaultMode = false;
			nodeMode = true;
			connMode = false;
			return;
		}
	}
	else if (mode === "conn") {
		if(!connMode) {
			defaultMode = false;
			nodeMode = false;
			connMode = true;
			return;
		}
	}
	defaultMode = true;
	nodeMode = false;
	connMode = false;
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
	zoomed = true;
	graph.attr("transform", "translate(" + d3.event.translate + ") scale (" + d3.event.scale + ")");
};

var zoom = d3.behavior.zoom()
			 .scaleExtent([0.5, 5])
			 .on("zoomstart", function(){
			 	//TODO cursor
			 })
			 .on("zoom", zoomBehavior)
			 .on("zoomend", function(){
			 	//TODO cursor
			 });
svg.call(zoom)
   .on("dblclick.zoom", null);

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

var editNodeText = function(d, d3Group){

	editNodeTextMode = true;

	var offsetX = 3,
		offsetY = 3;

	// var offsetX = d3Group.data()[0].x + 3,
		// offsetY = d3Group.data()[0].y + 3;

	//remove the current text
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
				   	// console.log(this);
				   	myTest = this;
				   	d.title = this.value;
				   	multipleLinesText(d.title, d3Group);
				     d3.select(document.getElementById("nodeTxtInput")).remove();
				     editNodeTextMode = false;
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
			//create a new edge
			var newEdge = {source:mousedownNode, target:mouseupNode};
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
				refresh();
			}
		}
	}
	//the node on mouse up and on mouse down is the same
	// 3 possible cases when this could happen
	// 1. node has been dragged
	// 2. node has been shift clicked to edit its text
	// 3. select node
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
		var trueCase = lastEl + "T";
		dataStr[trueCase] = 0.5;

		//False case - data
		var falseCase = lastEl + "F";
		dataStr[falseCase] = 1 - dataStr[trueCase];
	}
	else if(level < idsList.length-1) {
		//get the element from the front of the list
		var currEl = idsList[level];
		level++;

		//True case
		var trueCase = currEl + "T";
		dataStr[trueCase] = {};
		createCPT(dataStr[trueCase], idsList, level);			

		//False case		
		var falseCase = currEl + "F";
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
		var valT = cpt[lastEl+'T'];
		var chainT = chain + lastEl + 'T';
		// console.log(valT);
		html += '<td class="editable"> <input type="text" id="' + chainT + '" value="' + valT + '"></td> ';

		var valF = cpt[lastEl+'F'];
		var chainF = chain + lastEl + 'F';
		// console.log(valF);
		//TODO make it readonly
		// html += '<td class="editable"> <input type="text" id="' + chainF + '"value="' + valF + '" readonly></td>';
		html += '<td class="editable"> <input type="text" id="' + chainF + '"value="' + valF + '"></td>';		
		d3.select(".cptTable").append("tr").html(html);

	}
	//Recursive case
	else if (level < list.length -1) {
		var currEl = list[level];
		level++;

		var tmpHtml = html;
		var tmpChain = chain;
		//True case
		chain += currEl + 'T->';
		html += "<td>T</td>";
		var cptTrueCase = cpt[currEl + 'T']
		displayCPT(cptTrueCase, list, level, chain);

		html = tmpHtml;
		chain = tmpChain;
		//False case
		chain += currEl + 'F->';
		html += "<td>F</td>";
		var cptFalseCase = cpt[currEl + 'F'];		
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
		names.push(nodes[parents[i]].title.charAt(0));
	}
	console.log(names);

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
		currName += names[i] + " ";
	}
	currName += ")";
	html += '<td>' + currName + "=T" +'</td>'
	html += '<td>' + currName + "=F" +'</td>'
	d3.select(".cptTable").append("tr").html(html);
	html = "";
}

var isValidCPTEntry = function(num) {
	if(isNaN(num)) {
  		alert("NaNs are not acceptable.")
  		return false;
  	}
  	else if(num < 0 || num > 1) {
  		alert("Enter a valid probability value between 0 and 1");
  		return false;
  	}
  	return true;
}

//update table values when edited
var updateTbl = function(){
	var tblId = d3.select(".cptTable").attr("id");
	if(!tblId) {
		alert ("Table does not exist.")
	}

	var currCpt = nodes[tblId].tbl;
	if(!currCpt){
		alert("The CPT for this nodes cannot be accessed.");
	}

	cells = d3.selectAll("td.editable")
			  .selectAll("input")
			  .each(function(d, i) {
			  	path = this.id.split("->");
			  	//the nested cpt 
			  	var nestedCpt = currCpt;
			  	//get to the last level of the cpt
			  	for (var p=0; p<path.length-1; p++) {
			  		nestedCpt = currCpt[path[i]];
			  	}
			  	if(isValidCPTEntry(this.value)) {
			  		nestedCpt[path[path.length-1]] = this.value;
			  	}
			  	else {
			  		this.focus();
			  		//TODO change color
			  	}
			  });
}

//create & display table
var nodeDblClick = function(d) {
	// console.log(d);
	//clear the current table
	d3.select("#control").html("");
	html = "";
	//attach a new table
	d3.select("#control")
	  .append("table")
	  .attr("id", d.id)
	  .classed("cptTable", true);
	
	var parents = getNodeParents(d);
	parents.push(d.id);

	//CPT column names
	cptColumnNames(parents);
	var cpt;
	if (d.tbl) {
		cpt = d.tbl;
	}
	else {
		cpt = {}
		//create the internal cpt representation
		createCPT(cpt, parents, 0);
		// console.log(cpt);
		//assign the table as property of the current node
		d.tbl = cpt;
		//TODO change that for multiple values
		d.values = ['T', 'F'];		
	}

	//display the cpt
	displayCPT(cpt, parents, 0, "");
	
	// Handling editing CPTs events
	//TODO where to put it
 	d3.select(".cptTable")
 	  .append("button")
 	  .attr("class", "btn")
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
	    		   	  nodeDblClick(d);
	    		  }
    		   })
    		   .call(drag);

    //add circle for each group
    circleGroup.append("circle")
    		   .attr("r", r);

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

	//TODO is this working in all cases?
//	if(!nodeMode || mousedownNode || mousedownPath) {
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
var removeAssociatedEdges = function(node) {
	var edgesToDelete = edges.filter(function(e) {
		return (e.source === node || e.target === node);
	})
	console.log(edgesToDelete);
	edgesToDelete.map(function(e) {
		edges.splice(edges.indexOf(e), 1);
	})
};

var keyDown = function() {
	if(pressedKey !== -1)
	  return;
	pressedKey = d3.event.keyCode;

	switch(pressedKey) {
		case constants.BACKSPACE:
		case constants.DELETE:
			//prevent default only for these keys
			d3.event.preventDefault();
			if(selectedNode) {
				console.log("removing the selected node");
				nodes.splice(nodes.indexOf(selectedNode),1);
				removeAssociatedEdges(selectedNode);
			}
			else if(selectedPath) {
				edges.splice(edges.indexOf(selectedPath), 1);
			}
      selectedNode = null;
      selectedPath = null;
      refresh();
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
			var currParent = nodes[parents[p]]
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

var displaySamples = function(samples) {
	//clear the display space
	d3.select("#control").html("");

	//apend table for the results
	d3.select("#control")
	  .append("table")
	  .attr("class", "sampleTbl");

	//append the columns names
	sampleTblColumnNames();

	var accumulator = "";
	for (var s in samples) {
		for (val in samples[s]) {
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
	//get the number of samples to be made
	var noOfSamples = parseInt(d3.select("#numSamplesInput").node().value);
	if(isNaN(noOfSamples)) {
		alert("Please enter a valid number of samples.")
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
	  .attr("class", "btn")
	  .attr("id", "runSamplingBtn")
	  .html("Run")
	  .on("click", ancestralSampling);
}

svg.on("mousedown", svgMouseDown)
   .on("mouseup", svgMouseUp);

d3.select("#workspace")
  .on("keydown", keyDown)
  .on("keyup", keyUp);
//TODO temporary
d3.select("#nodeMode")
  .on("click", function(){
  	setMode("node");
  });
d3.select("#connMode")
  .on("click", function(){
  	setMode("conn");
  })
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