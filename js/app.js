//variables
var width,
	height,
	radius,
	pressedKey,
	constants;

var	svg,
	control,
	force;

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

//TODO dragged and focused not needed anymore - remove?
var dragged,
	zoomed,
	connecting,
	focused,
	uploaded;

var defaultMode;
	// sampleMode;

var setDefaultMode = function(){
	//clear the display field
	clearDisplayField();

	defaultMode = true;	
};

//handle drag behaviour
var dragmove = function(d) {
	//handle when a line is being dragged to connect 2 nodes
	// if(connMode) {
	if(selectedNode === d && connecting) {
		// connecting = true;
		//display the dragline
		dragline.attr("d", "M" + d.x + "," + d.y + "L" + d3.mouse(graph.node())[0] + "," + d3.mouse(graph.node())[1]);
	}
	// //handle node dragging
	else {
		//set the state to being dragged
		dragged = true;			
		//move the node
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
			 	force.stop();
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
			 	// if(!editNodeTextMode) {
				 	zoomBehavior();			 		
			 	// }
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

	// Append the slider
	var slider = control.append("div")
		   				.classed("da-slider my-slider", true)
		   				.attr("id", "help-slider");

	// Append frames for the slideshow 
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Add a Node: </span> Double-click on the canvas.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Edit Node: </span> Click on the node and edit its name, CPT or values it can take from the menu on the right.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Delete Node: </span> Right-click on the node and select <span class='instructions-text-control'>\'Remove Node\'</span>.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Add Link: </span> Select a node and click on it simulataneously dragging to the node you want to connect it to.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Delete Link: </span> Right-click on the link and select <span class='instructions-text-control'>\'Remove Link\'</span>.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Sample Data: </span> Select <span class='instructions-text-control'>\'Sample from Network\'</span> option from <span class='instructions-text-control'>\'My Network\'</span> control. In the settings menu that will appear on the right side of the screen select any values that you want to be fixed and the number of samples and click <span class='instructions-text-control'>\'Run\'</span>.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Load a Dataset: </span> From the <span class='instructions-text-control'>\'Load\\Save\'</span> menu option - select either <span class='instructions-text-control'>\'Use Toy Dataset\'</span> option or <span class='instructions-text-control'>\'Import CSV\'</span> to import a .csv file.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Learn Network Structure: </span> After loading a dataset, select <span class='instructions-text-control'>\'Learn Structure\'</span> option from <span class='instructions-text-control'>\'My Network\'</span> menu.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Learn Network CPTs: </span> After loading a dataset, select <span class='instructions-text-control'>\'Learn Parameters\'</span> option from <span class='instructions-text-control'>\'My Network\'</span> menu.")
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("Other options you can explore are importing/exporting different file formats and using pre-loaded data."); 

	// Append the arrows 
	var arrowsNav = slider.append("nav")
						  .attr("class", "da-arrows");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-prev");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-next");

	// Start the slider
	$('#help-slider').cslider({
		// index of current slide
		// current		: 0, 	
		// increment the background position 
		// (parallax effect) when sliding	
		bgincrement	: 50,	
		// slideshow on / off	
		autoplay	: true,
		// time between transitions	
		// interval	: 3000 
	});

}

var displayInfo = function() {
	clearDisplayField();

	// Append the slider
	var slider = control.append("div")
		   				.classed("da-slider my-slider", true)
		   				.attr("id", "info-slider");
	// Append frames for the slideshow 
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("Bayesian Networks are graphical models for reasoning under uncertainty.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("Bayesian Networks are directed acyclic graphs(DAGs). Networks designed by the user should not contain cycles.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("BNs are represented by nodes and arcs, where the nodes are random variables and an arc shows a direct causal connections between a parent node and a child node.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("Each node can have up to 10 values. The values need to be discrete, mutually exclisive and exhaustive for the domain. The default values for each node are 1 and 0 (True and False).")
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("Ancestral(Direct) Sampling algorithm is used to generate sample data from a network. The user can fix the values for any of the nodes. If all the values but one are fixed the sampling method will also act as a classifier.")
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("The structure and the parameters of a network can be learnt from sample data. The algorithm used for learning a structure is called the PC Algorithm.")
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("If there is a network with known structure but not known probabilities for the random variables, sample data can be used to learn the probabilities for the network.")

	// Append the arrows 
	var arrowsNav = slider.append("nav")
						  .attr("class", "da-arrows");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-prev");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-next");

	// Start the slider
	$('#info-slider').cslider({
		// index of current slide
		current		: 0, 	
		// increment the background position 
		// (parallax effect) when sliding	
		bgincrement	: 50,	
		// slideshow on / off	
		autoplay	: true,
		// time between transitions	
		interval	: 3000 
	});
}

var displayAbout = function() {
	clearDisplayField();
	// TODO
	// Append the slider
	var slider = control.append("div")
		   				.classed("da-slider my-slider", true)
		   				.attr("id", "about-slider");
	// Append frames for the slideshow 
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("BayANet has been developed as a third year project by Anna Aleksieva in the School of Computer Science.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("The tool has been developed to serve as a teaching tool for COMP61011.");	
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("The aim of this application is to overcome the limitations of other existing Bayesian Networks tools and to provide beginners with understanding of the core principles of BNs.");	

	// Append the arrows 
	var arrowsNav = slider.append("nav")
						  .attr("class", "da-arrows");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-prev");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-next");

	// Start the slider
	$('#about-slider').cslider({
		// index of current slide
		current		: 0, 	
		// increment the background position 
		// (parallax effect) when sliding	
		bgincrement	: 50,	
		// slideshow on / off	
		autoplay	: true,
		// time between transitions	
		interval	: 3000 
	});	
};

var displayResources = function(){

	clearDisplayField();

	// Append the slider
	var slider = control.append("div")
		   				.classed("da-slider my-slider", true)
		   				.attr("id", "resources-slider");
// TODO
	// Append frames for the slideshow 
	// slider.append("div")
	// 	  .classed("da-slide", true)
	// 	  .append("p")
	// 	  .attr("class", "instructions-text text-justified")
	// 	  .html("BayANet has been developed as a third year project by Anna Aleksieva in the School of Computer Science.");
	// slider.append("div")
	// 	  .classed("da-slide", true)
	// 	  .append("p")
	// 	  .attr("class", "instructions-text text-justified")
	// 	  .html("The tool has been developed to serve as a teaching tool for COMP61011.");	
	// slider.append("div")
	// 	  .classed("da-slide", true)
	// 	  .append("p")
	// 	  .attr("class", "instructions-text text-justified")
	// 	  .html("The aim of this application is to overcome the limitations of other existing Bayesian Networks tools and to provide beginners with understanding of the core principles of BNs.");	


	// Append the arrows 
	var arrowsNav = slider.append("nav")
						  .attr("class", "da-arrows");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-prev");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-next");

	// Start the slider
	$('#resouces-slider').cslider({
		// index of current slide
		current		: 0, 	
		// increment the background position 
		// (parallax effect) when sliding	
		bgincrement	: 50,	
		// slideshow on / off	
		autoplay	: true,
		// time between transitions	
		interval	: 3000 
	});	
};

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
		 })
		 .on("contextmenu", d3.contextMenu(edgeMenu));

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
    		      nodeMouseDown(d, d3.event.which);
    		   })
			   .on("mouseup", function(d){
			   	  //need to have propagation for dragging
			   	  nodeMouseUp(d, d3.select(this));
    		   })
    		   .on("dblclick", function(d){
    		   	  d3.event.stopPropagation();
    		   	  displayNodeInfo(d);
    		   })
    		   .on("contextmenu", d3.contextMenu(nodeMenu))
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
    });
   			    			    			    			
    //remove old circles
    circles.exit().remove();	   
};

//on double click on the canvas, create a new node
var svgDblClick = function(){
	addNewNode();
	//when a new node is added, display its info
	displayNodeInfo(selectedNode);
}

var svgMouseDown = function(){
	// deselect a selected node
	if(selectedNode) {
		selectedNode = null;
		refresh();
		clearDisplayField();
	}
	// deselect a selected link
	else if(selectedPath) {
		selectedPath = null;
		refresh();
	}
};

var svgMouseUp = function(){

	//if in conn mode, discard the dragline
	if(connecting) {
		dragline.classed("hidden", true);
		connecting=false;
	}
};

var deleteData = function(){
	rawTxt = null;
	csvData = null;
	fData = null;

	// change the dataset label
	d3.select("#dataset-name")
	.html("Dataset: (none)")
	.classed("notice-text", false);

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
}

var deleteNetwork = function(isConfirm, all) {
	if(isConfirm) {
		bootbox.confirm("Are you sure you want to delete the network?", function(result) {
	  		if(result) {
				nodes = [];
				edges = [];
				lastID = 0;
				refresh();
				setDefaultMode();
				if(all) {
					deleteData();
				}
	  		}
		});		
	}
	else {
		nodes = [];
		edges = [];
		lastID = 0;
		refresh();		
		setDefaultMode();
		if(all) {
			deleteData();
		}
	}
}

var forceLayout = function(nodes, links) {
	// var force = d3.layout.force()
	// 			  .size([width, height])
	// 			  .nodes(nodes)
	// 			  .links(links)
	// 			  // TODO change
	// 			  .linkDistance(30)
	// 			  .charge(-120);
	// // console.log("force");

	// force.on("end", function(){
	// 	// update positions of nodes
 //        circles.attr("transform", function(d){
 //        	console.log("translate(" + d.x + "," + d.y + ")");
 //        	return "translate(" + d.x + "," + d.y + ")";
 //        });

	// 	// update positions of links
	// 	paths.attr("d", function(d){
	// 	 	return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;			
	// 	})
	// });
	// force.start();
	force.nodes(nodes)
		 .links(links)
		 .start();
}

var maxNodeId = function(){
	return Math.max.apply(Math, nodes.map(function(n) {return n.id}));
}

window.onbeforeunload = function() {
	// TODO uncomment
	// return "Any progress you have made is not going to be saved.";
}

window.onresize = function() {
	var updatedWidth = document.getElementById("workspace").offsetWidth - 20;
	var updatedHeight = 0.82 * window.innerHeight;
	svg.attr("width", updatedWidth);
	svg.attr("height", updatedHeight);
}

var init = function() {
	//svg width & height
	width = document.getElementById("workspace").offsetWidth -20;
	height = 0.82 * window.innerHeight;
	radius=25;
	pressedKey = -1;
	
	//TODO remove?
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
	connecting = false;
	focused = false;
	uploaded = false;
	
	//work mode
	defaultMode = true;

	nodes = [];
	edges = [];
	lastID=1;

	// initialise force layout
	force = d3.layout.force()
				  .size([width, height])
				  // TODO change
				  .linkDistance(150)
				  .charge(-250);

	force.on("tick", function(){
		// update positions of nodes
        circles.attr("transform", function(d){
        	// console.log("translate(" + d.x + "," + d.y + ")");
        	return "translate(" + d.x + "," + d.y + ")";
        });

		// update positions of links
		paths.attr("d", function(d){
		 	return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;			
		})
	});
	// end 

	control = d3.select("#control");

	svg = d3.select("#workspace")
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("id", "svg")
				.attr("class", "tour-step tour-step-six")
				.attr("version", 1.1)
				.attr("xmlns", "http://www.w3.org/2000/svg");
	
	//arrow markers
	//parts of the code used from these examples http://tutorials.jenkov.com/svg/marker-element.html
	svg.append("defs")
	   .append("marker")
	   .attr("id", "arrow")
	   .attr("viewBox", "0 -5 10 10")
	   .attr("refX", 24.5)
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
	graph = svg.append("g").attr("id", "graph");
	paths = graph.append("g").selectAll("path");
    circles = graph.append("g").selectAll("g");
	
	//dragline
	dragline = graph.append("path")
					.attr("class", "conn hidden dragline")
				 	.attr("d", "M0,0L0,0")
				 	.style("marker-end", "url(#dragline-arrow)");	

	// svg.on("mousedown", svgMouseDown)
	svg.on("dblclick", svgDblClick)
	   .on("mousedown", svgMouseDown)
	   .on("mouseup", svgMouseUp)
	   .on("mouseover", function() {
		   focused = true;
	   })
	   .on("mouseout", function() {
	   	   focused = false;
	   })
	   .call(zoom); 
	svg.on("dblclick.zoom", null);

	d3.select("#downloadNet")
	  .on("click", function() {
	  	specifyDownloadName(1, ".json");
	  	// downloadNetwork();
	  });
	d3.select("#deleteNet")
	  .on("click", function(){
	  	deleteNetwork(true, true);
	  	// deleteData();
	  });
	d3.select("#uploadNet")
	  .on("click", function(){
	  	document.getElementById("hidden-upload").click();
	  });
	d3.select("#hidden-upload")
	  .on("change", uploadNetwork);

	d3.select("#sample-net")
	  .on("click", function() {
	  	// setMode("sample");
	  	samplingSettings();
	  });
	d3.select("#uploadSample")
	  .on("click", function(){
	  	document.getElementById("hidden-upload-2").click();
	  });
	d3.select("#hidden-upload-2")
	  .on("change", function() {
	  	uploadSample();
	  });

	//upload .bif
	d3.select("#uploadBif")
	  .on("click", function(){
	  	document.getElementById("hidden-upload-3").click();
	  })
	d3.select("#hidden-upload-3")
	  .on("change", uploadBif);

	//help info about the tool controls
	d3.select("#help")
	  .on("click", function(){
	  	//display instructions
	  	displayHelp();
	  });
	// about the tool
	d3.select("#about")
	  .on("click", function(){
	  	//display info
	  	displayAbout();
	  });
	// about BNs
	d3.select("#info")
	  .on("click", function(){
	  	// TODO links to helpful websites
	  	displayInfo();
	  });
	// resources for BNS
	d3.select("#resources")
	  .on("click", function(){
	  	// TODO
	  	// displayResources();
	  })

	// example networks
	d3.select("#loadNet")
	  .on("click", loadExampleNetworks);
	// example datasets
	d3.select("#loadData")
	  .on("click", loadExampleData);
	//download a png image of the current state of the svg
	d3.select("#downloadImg")
	  .on("click", function() {
	  	specifyDownloadName(3, ".png");
	  });

	// learn the parameters
	d3.select("#learnParams")
	  .on("click", function(){
	  	learnParameters();
	  });

	// learn the structure
	d3.select("#learnStruct")
	  .on("click", function(){
	  	learnStructure();
	  })
	//display zoom scale
	d3.select("#workspace")
	  .append("p")
	  .attr("id", "zoom-scale")
	  .attr("class", "pull-right zoom-text")
	  .text("Zoom Scale: " + zoom.scale().toFixed(2));  	  	
}();

//Initialise
loadDefaultNetwork("files/nets/burglaryNetFull.json", true);
