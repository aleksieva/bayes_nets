//variables
var height,
	radius,
	pressedKey,
	constants;

var	svg,
	control;

var nodes,
	edges,
	lastID;

var graph,
	paths,
	circles,
	dragline;

var selectedNode,
	selectedPath,
	mousedownNode;

var dragged,
	zoomed,
	focused,
	uploaded;

var defaultMode,
	nodeMode,
	connMode,
	editNodeTextMode,
	editNodeMode,
	sampleMode;

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

var drag = d3.behavior.drag()
			 .origin(function(d){
			 	return {x: d.x, y:d.y};
			 })
			 .on("dragstart", function(){
			 	d3.event.sourceEvent.stopPropagation();
			 	svg.style("cursor", "pointer");
			 })
			 .on("drag", dragmove)
			 .on("dragend", function(){
			 	svg.style("cursor", "default");
			 });

//handle zoom behaviour
var zoomBehavior = function(d){
	// zoomed = true;

	graph.attr("transform", "translate(" + d3.event.translate + ") scale (" + d3.event.scale + ")");
};

var zoom = d3.behavior.zoom()
			 .scaleExtent([0.5, 2])
			 .on("zoomstart", function(){
			 	svg.style("cursor", "move");
			 })
			 .on("zoom", function() {
			 	if(!editNodeTextMode) {
				 	zoomBehavior();			 		
			 	}
			 })
			 .on("zoomend", function(){
			 	svg.style("cursor", "default");
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

var displayHelp = function() {
	clearDisplayField();
	//if sample mode - turn it off
	if(sampleMode) {
		setMode("sample");
	}
	// setMode("");
	//help page
	control.append("p")
		   .attr("class", "instructions-text text-justified")
		   .html("<span class='instructions-text-title'> Add a Node : </span> Select the \'Add Node\' mode and click on the work field.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Edit Node Name: </span> Shift-click on the node.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Edit Node: </span> Select the \'Edit Node \' mode and click on the node to edit.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Delete Node: </span> In \'Edit Node \' mode for the node you want to delete - click \'Delete Node \' button or press Backspace");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Add Link: </span> In \'Add Link \' mode drag a line from one node to another.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Reverse Link: </span>");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Delete Link: </span>");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Sample Data: </span>");			   		   	   		   		   		   
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

// //Added predefinedCircle for Jasmine tests
// var addNewNode = function(predefinedCircle) {
// 	//add new node
// 	var circleCenter = predefinedCircle ? [100, 200] : d3.mouse(graph.node()),
// 		xPos = circleCenter[0],
// 		yPos = circleCenter[1],
// 		newNode = {id:++lastID, title:"New Node", x:xPos, y:yPos, values:['1', '0']};

// 	nodes.push(newNode);
// 	newNode.title = duplicateNodeTitles(newNode.title, newNode);
// 	//refresh to add the node
// 	refresh();
// 	selectedNode = newNode;	
// 	//refresh to select the node
// 	refresh();
// };

var svgMouseDown = function(){
	if(!nodeMode) {
		return;
	}
	else if(nodeMode && editNodeTextMode) {
		editNodeTextMode = false;
		return;
	}

	addNewNode();

	//when a new node is added get out of add node mode and go to edit mode for this node
	setMode("edit")
	displayNodeInfo(selectedNode);
};

var svgMouseUp = function(){
	if(mousedownNode && connMode) {
		dragline.classed("hidden", true);
	}
};

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

//TODO uncomment
// window.onbeforeunload = function() {
// 	return "Any progress you have made is not going to be saved.";
// }

window.onresize = function() {
	var updatedHeight = 0.78 * window.innerHeight;

	svg.attr("height", updatedHeight);
}

//Initialise
var loadDefaultNetwork = function() {
	d3.json("files/burglaryNet.json", function(error, netData) {
	  // console.log(netData);
	  nodes = netData.nodes;
	  console.log(nodes);
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
	  setMode("");
	  //display instructions
	  displayHelp();
	  // //display zoom scale
	  // d3.select("#workspace")
	  //   .append("p")
	  //   .attr("id", "zoom-scale")
	  //   .attr("class", "pull-right zoom-text")
	  //   .text("Zoom Scale: " + zoom.scale().toFixed(2)); 		  
	  });
};

var init = function() {
	//svg width & height
	height = 0.78 * window.innerHeight;
	radius=20;
	pressedKey = -1;
	
	constants = {
		BACKSPACE: 8,
		ENTER: 13,
		DELETE:46
	};

	//mouse event variables
	selectedNode = null;
	selectedPath = null;
	mousedownNode = null;
	
	//status states
	dragged = false;
	zoomed = false;
	focused = false;
	uploaded = false;
	
	//work mode
	defaultMode = true;
	nodeMode = false;
	connMode = false;
	editNodeTextMode = false;
	editNodeMode = false;
	sampleMode = false;

	//default nodes and links
	// nodes = [
	// 	{id: 0, title: "Smoker", x: 450, y: 100, values:['1','0']},
	// 	{id: 1, title: "Bronchitis", x: 450, y: 250, values:['1', '0']}
	// ];
	// edges = [
	// 	{source: nodes[0], target:nodes[1]}
	// ];
	nodes = [];
	edges = [];
	lastID=1;

	control = d3.select("#control");

	svg = d3.select("#workspace")
				.append("svg")
				.attr("width", "100%")
				.attr("height", height)
				.attr("id", "svg")
				.attr("class", "tour-step tour-step-six");
	
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
	graph = svg.append("g");
	paths = graph.append("g").selectAll("path");
    circles = graph.append("g").selectAll("g");
	
	//dragline
	dragline = graph.append("path")
					.attr("class", "conn hidden dragline")
				 	.attr("d", "M0,0L0,0")
				 	.style("marker-end", "url(#dragline-arrow)");	

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

	//key up and down events
	d3.select(window)
	  .on("keydown", keyDown)
	  .on("keyup", keyUp);

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

	//display zoom scale
	d3.select("#workspace")
	  .append("p")
	  .attr("id", "zoom-scale")
	  .attr("class", "pull-right zoom-text")
	  .text("Zoom Scale: " + zoom.scale().toFixed(2));  	  	
}();

//Initialise
loadDefaultNetwork();