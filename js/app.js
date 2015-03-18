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

var isEmptyString = function(text) {
	return text.length === 0 || /^\s*$/.test(text);
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
		   .html("<span class='instructions-text-title'> Delete Node: </span> In \'Edit Node \' mode for the node you want to delete - click \'Delete Node \' button or in any mode press Backspace/Delete");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Add Link: </span> In \'Add Link \' mode drag a line from one node to another.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Reverse Link: </span> Drag a link in the opposite direction of the already existing link to reverse it.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Delete Link: </span> Select a link by clicking on it and press Backspace/Delete.");
	control.append("p")
		   .attr("class", "instructions-text text-justified")	
		   .html("<span class='instructions-text-title'> Sample Data: </span> Select \'Sample from Network\' mode and in the settings menu that will appear on the right side of the screen select any values that you want to be fixed and the number of samples and click \'Run\'.");			   		   	   		   		   		   
}

var displayAbout = function() {
	clearDisplayField();
	//if sample mode - turn it off
	if(sampleMode) {
		setMode("sample");
	}

	control.append("p")
		   .attr("class", "instructions-text text-justified")
		   .html("Bayesian Networks are graphical models for reasoning under uncertainty. BNs are represented by nodes and arcs, where the nodes are random variables and the arcs show a direct causal connections between ");

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
	d3.select("#filename").focus();
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
		var fileReader = new FileReader();
		var uploadFile = d3.select("#hiddenUpload").node().files[0];

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

window.onbeforeunload = function() {
	return "Any progress you have made is not going to be saved.";
}

window.onresize = function() {
	var updatedHeight = 0.78 * window.innerHeight;

	svg.attr("height", updatedHeight);
}

//Initialise
var loadDefaultNetwork = function(filepath, isInitial, val) {
	//delete previous network
	deleteNetwork(false);
	d3.json(filepath, function(error, netData) {		
	  // console.log(netData);
	  nodes = netData.nodes;
	  // console.log(nodes); 
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
	  if (isInitial) {
		//display instructions
		displayHelp();
	  }
	  else {
	  	loadExampleNetworks(val);
	  }; 		  
	});
};

var identifyExampleNetFilepath = function(val) {
	if(val === "rain") {
		loadDefaultNetwork("files/wetGrassNet.json", false, val)		
	}
	else if(val === "burglary") {
		loadDefaultNetwork("files/burglaryNetFull.json", false, val)
	}
	else if(val === "cancer") {
		loadDefaultNetwork("files/cancerNet.json", false, val)		
	}
	else if(val === "bronchitis") {
		loadDefaultNetwork("files/smokerBronchitis.json", false, val)
	}
}
var loadExampleNetworks = function(selValue) {
	console.log("selValue: " + selValue)
	clearDisplayField();

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
		  .text("Select Network")
	select.append("option")
		  .attr("value", "rain")
		  .text("Rain Network");
	select.append("option")
		  .attr("value", "burglary")
		  .text("Burglary Network");
	select.append("option")
		  .attr("value", "cancer")
		  .text("Cancer Network");
	select.append("option")
		  .attr("value", "bronchitis")
		  .text("Basic Bronchitis Network");

	control.append("hr");

	var options = select.selectAll("option")[0];
	options.forEach(function(option) {
		if(option.value === selValue) {
			d3.select(option)
			  .attr("selected", true);
		}
	})
}

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
	  .on("change", function() {
	  	uploadSample();
	  });
	d3.select("#help")
	  .on("click", function(){
	  	//display instructions
	  	displayHelp();
	  });
	d3.select("#about")
	  .on("click", function(){
	  	//display info
	  	displayAbout();
	  });
	d3.select("#loadNet")
	  .on("click", loadExampleNetworks);

	//display zoom scale
	d3.select("#workspace")
	  .append("p")
	  .attr("id", "zoom-scale")
	  .attr("class", "pull-right zoom-text")
	  .text("Zoom Scale: " + zoom.scale().toFixed(2));  	  	
}();

//Initialise
loadDefaultNetwork("files/burglaryNetFull.json", true);