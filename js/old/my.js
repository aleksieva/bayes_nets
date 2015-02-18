//Draw connections

/*
var draw = function(selection) {
	var startPt,
		path,
		isDrawing=false,
		line=d3.svg.line()
				.x(function(d) {return d[0];})
				.y(function(d) {return d[1];});

	selection.on("mousedown", function() {
		if (connOn) {
			if (!isDrawing) {
				isDrawing=true;
				console.log(d3.transform(selection.attr("transform")).translate);
				console.log(selection);
				startPt = d3.mouse(d3.select("svg").node());
				//TODO can be simplified
				// startPt[0] += d3.transform(selection.attr("transform")).translate[0];
				// startPt[1] += d3.transform(selection.attr("transform")).translate[1];
				translation = d3.transform(selection.attr("transform")).translate;
				// startPt[0] = 800+ translation[0] + startPt[0];
				// startPt[1] = 40 + translation[1] + startPt[1];
				console.log(startPt);
				path = svg.append("path")
						.attr("d", line([startPt, startPt]))
						.attr("class", "conn");
						// .call(drag);
				// console.log("First element", selection.attr("cx"), selection);
			}				
		}
	});
	svg.on("mouseup", function() {
		if(isDrawing) {
			isDrawing=false;
		}
	});
	svg.on("mousemove", function(d) {
		if (isDrawing) {
			newLine = line([startPt, d3.mouse(svg.node())])
			// console.log(d3.mouse(svg.node()));
			// console.log(newLine)
			path.attr("d", newLine);
		}
	})
}
*/





// On drag
// var dragmove = function(d) {
// 	if(!connOn) {
// 		var x = d3.event.x;
// 		var y = d3.event.y;

// 		d3.select(this)
// 		  .attr("transform", "translate(" + x + "," + y + ")");
// 	}
// };

//On dragend
// 1. Check if the element is being dragged to the bin
// 2. Check if the element is in the workspace - if not undo the drag
var dragended = function(d) {

	// console.log(d3.event.sourceEvent);
	// console.log(d3.select(this));

	var x = d3.event.sourceEvent.x;
	var y = d3.event.sourceEvent.y;
	// console.log(x);
	// console.log(y);


	// Check if element is dragged to the bin
	var leftBorder = d3.transform(bin.attr("transform")).translate[0],
	// var leftBorder = parseInt(bin.attr("x")),
		rightBorder = leftBorder + parseInt(bin.attr("width")),
		topBorder = d3.transform(bin.attr("transform")).translate[1],
		// topBorder = parseInt(bin.attr("y"))
		bottomBorder = topBorder + parseInt(bin.attr("height"));

	// console.log(leftBorder);
	// console.log(rightBorder);
	// console.log(topBorder);
	// console.log(bottomBorder);
	
	// if ((x-leftBorder)*(x-rightBorder)<0 && (y-topBorder)*(y-bottomBorder)<0){
	// TODO CHANGE!!!!	
	if ((x-leftBorder)*(x-rightBorder)<0 && (y-210)*(y-340)<0){
		// console.log("REMOVE");
		d3.select(this).remove()
	}
}

// var connOn = false;
// var clickConnBtn = function(selection) {
// 	connOn = !connOn;
// 	if(connOn) { //clicked
// 		d3.select(this).attr("class", "selected-ctrl");
// 		//svg.selectAll("circle").on("mousedown",startLineDraw);
// 	}
// 	else { //unclicked
// 		d3.select(this).attr("class", "control");
// 		// svg.selectAll("circle").call(drag);
// 	}
// }

// //Drag behavior
// var drag = d3.behavior.drag().on("drag", dragmove).on("dragend", dragended);

// // Create new circle on click of the model circle
// var createNode = function() {
// 	//Ignore the click event 
// 	if (d3.event.defaultPrevented) return;

// 	if(!connOn) {
// 		// Node model
// 		var newNode = svg.append("g")
// 					     .attr("transform", "translate(800,40)")
// 						 .style("cursor", "pointer")
// 						 // .on("mousedown", createNode);
// 						 // .call(dragend)
// 						 .call(drag);

// 		// newNode.on("mousedown",startLineDraw);
// 		// if (connOn) {
// 		// 	newNode.on("mousedown",startLineDraw);
// 		// }else {
// 		// 	newNode.call(drag);
// 		// }					 

// 		// New circle from the model that is going to be dragged in the workspace
// 		var newModel = newNode.append("circle")
// 	   		.attr("cx", 0)
// 	   		.attr("cy", 0)
// 	   		.attr("r", 20)
// 	   		// .attr("transform", "translate(" + 800 + "," + 40 + ")")
// 	   		.attr("class", "node")
// 	   		// .style("cursor", "pointer")
// 	   		// .call(drag)
// 	   		.on("mousedown", createNode);

// 	   	var newGroup = newNode.append("g");
// 	   	// newModel.call(draw
// 		newGroup.append("rect")
// 			  .attr("width", connPW)
// 			  .attr("height", connPH)
// 			  .attr("class", "conn-point")
// 			  .attr("transform", "translate(-3,-26)")
// 			  // .on("click", draw);
// 			  .on("mousedown",startLineDraw);

// 		newGroup.append("rect")
// 			  .attr("width", connPW)
// 			  .attr("height", connPH)
// 			  .attr("class", "conn-point")
// 			  .attr("transform", "translate(20,0)")
// 			  // .on("click", draw);
// 			  .on("mousedown",startLineDraw);

// 		newGroup.append("rect")
// 			  .attr("width", connPW)
// 			  .attr("height", connPH)
// 			  .attr("class", "conn-point")
// 			  .attr("transform", "translate(-3,20)")
// 			  // .on("click", draw);
// 			  .on("mousedown",startLineDraw);

// 		newGroup.append("rect")
// 			  .attr("width", connPW)
// 			  .attr("height", connPH)
// 			  .attr("class", "conn-point")
// 			  .attr("transform", "translate(-26,0)")
// 			  // .on("click", draw);
// 			  .on("mousedown",startLineDraw);

// 		// svg.append("circle")
// 	 //   	   .attr("cx", 0)
// 		//    .attr("cy",0)
// 		//    .attr("r", 20)
// 		//    .attr("transform", "translate(" + 800 + "," + 40 + ")")
// 		//    .attr("class", "node")
// 		//    .style("cursor", "pointer")
// 		//    .call(drag)
// 		//    .on("mousedown", createCircle);
// 	}
// }

var startPt,
	path,
	isDrawing=false,
	line=d3.svg.line()
			.x(function(d) {return d[0];})
			.y(function(d) {return d[1];});

var startLineDraw = function(d) {
	if (connOn) {
		if (!isDrawing) {
			isDrawing=true;
			//console.log(d3.transform(selection.attr("transform")).translate);
			//console.log(selection);
			startPt = d3.mouse(d3.select("svg").node());
			//TODO can be simplified
			// startPt[0] += d3.transform(selection.attr("transform")).translate[0];
			// startPt[1] += d3.transform(selection.attr("transform")).translate[1];
			//translation = d3.transform(selection.attr("transform")).translate;
			// startPt[0] = 800+ translation[0] + startPt[0];
			// startPt[1] = 40 + translation[1] + startPt[1];
			console.log(startPt);
			path = svg.append("path")
					.attr("d", line([startPt, startPt]))
					.attr("class", "conn")
					.style("cursor", "pointer");
					// .call(drag);
			// console.log("First element", selection.attr("cx"), selection);
		}				
	}
} 
	

// // Create the SVG
// var w = 850,
// 	h = 500,
// 	margin = 10,
// 	ctrl_w = 100;

// var svg = d3.select("#workspace")
// 			.append("svg")
// 			.attr("width", w)
// 			.attr("height", h)
// 			.style("border", "1px solid black");

// // svg.on("mousedown",startLineDraw);

// // Control field for creating circles			
// var create = svg.append("rect")
//    .attr("width", 100)
//    .attr("height", 80)
//    // .attr("x", 750)
//    // .attr("y", 0)
//    .attr("transform", "translate(750,0)")
//    .attr("class", "control")

// // Control field - create connections
// svg.append("rect")
//    .attr("width", 100)
//    .attr("height", 80)
//    // .attr("x", 750)
//    // .attr("y", 80)
//    .attr("transform", "translate(750 ,80)")
//    .attr("class", "control")
//    .on("click", clickConnBtn);

// // Control field - removing elements  
// var bin = svg.append("rect")
//    // .attr("x", 750)
//    // .attr("y", 160)
//    .attr("width", 100)
//    .attr("height",80)
//    .attr("transform", "translate(750,160)")
//    .attr("class", "control");


// // Node model
// gNode= svg.append("g")
// 		   .attr("transform", "translate(800,40)")
// 		   .style("cursor", "pointer")
// 		   // .on("mousedown", createNode);
// 		   .call(drag);
// // gNode.on("mousedown",startLineDraw);
// // if (connOn) {
// // 	gNode.on("mousedown",startLineDraw);
// // }else {
// // 	gNode.call(drag);
// // }

// var model = gNode.append("circle")
//    .attr("cx", 0)
//    .attr("cy", 0)
//    .attr("r", 20)
//    // .attr("transform", "translate(" + 800 + "," + 40 + ")")
//    .attr("class", "node")
//    // .style("cursor", "pointer")
//    // .call(drag)
//    .on("mousedown", createNode);

// // model.on("mousedown",startLineDraw);
// var connPW = 10;
// var connPH = 10;

// var g = gNode.append("g");

// gNode.append("rect")
// 		  .attr("width", connPW)
// 		  .attr("height", connPH)
// 		  .attr("class", "conn-point")
// 		  .attr("transform", "translate(-3,-26)")
//   		  // .on("click", draw);
//   		  .on("mousedown",startLineDraw);

// g.append("rect")
// 		  .attr("width", connPW)
// 		  .attr("height", connPH)
// 		  .attr("class", "conn-point")
// 		  .attr("transform", "translate(20,0)")
//   		  .on("mousedown",startLineDraw);
// 		  // .on("click", draw);		  

// g.append("rect")
// 		  .attr("width", connPW)
// 		  .attr("height", connPH)
// 		  .attr("class", "conn-point")
// 		  .attr("transform", "translate(-3,20)")
//   		  .on("mousedown",startLineDraw);
//   		  // .on("click", draw);

// g.append("rect")
// 		  .attr("width", connPW)
// 		  .attr("height", connPH)
// 		  .attr("class", "conn-point")
// 		  .attr("transform", "translate(-26,0)")
//   		  .on("mousedown",startLineDraw);
		  // .on("click", draw);

// var g = svg.append("g");
//  g.append("svg:image")
//    .attr("xlink:href", "img/waste_bin.svg")
//    .attr("x", 10)
//    .attr("y", 10)
//    .attr("width", 200)
//    .attr("height",150);

// var g = svg.append("g");

// var img = g.append("svg:image")
//     .attr("xlink:href", "img/waste_bin.svg")
//     .attr("width", 200)
//     .attr("height", 200)
//     .attr("x", 228)
//     .attr("y",53);


/* ANS + N = REFACTOR */



svg.on("mouseup", function() {
	if(isDrawing) {
		isDrawing=false;
	}
});
svg.on("mousemove", function(d) {
	if (isDrawing) {
		newLine = line([startPt, d3.mouse(svg.node())])
		// console.log(d3.mouse(svg.node()));
		// console.log(newLine)
		path.attr("d", newLine);
	}
});
