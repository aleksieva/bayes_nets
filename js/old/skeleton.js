//Gloval scope variable 
scope = {};

scope.init = function() {

	// Create the SVG
	scope.w = 850;
	scope.h = 450;
	scope.margin = 10;
	scope.ctrlW = 100;
	scope.ctrlH = 80;


	scope.svg = d3.select("#workspace")
				.append("svg")
				.attr("width", scope.w)
				.attr("height", scope.h)
				.attr("id", "svg");

	// marker end arrow for connectors
	// scope.defs = scope.svg.append("defs");
	// // scope.marker = scope.defs.append("marker")
	// // 				 .attr("id", "endtriangle")
	// // 				 .attr("markerWidth", 13)
	// // 				 .attr("markerHeight", 13)
	// // 				 .attr("refx", 2)
	// // 				 .attr("refy", 6)
	// // 				 .attr("orient", "auto");

	// scope.marker = scope.defs.append("svg:marker")
	//             .attr("id", "endtriangle")
	//             .attr("viewBox","0 0 10 10")
	//             .attr("refX","20")
	//             .attr("refY","5")
	//             .attr("markerUnits","strokeWidth")
	//             .attr("markerWidth","9")
	//             .attr("markerHeight","5")
	//             .attr("orient","auto")
	//             .append("svg:path")
	//             .attr("d","M 0 0 L 10 5 L 0 10 z")
	//             .attr("fill", "#BBBBBB");

	scope.ctrlGroup = scope.svg.append("g")
								.attr("transform", "translate("+ (scope.w - scope.ctrlW) + "," + 0 + ")");
	//Create control field
	var createCtrlField = function(y, id) {
		scope.ctrlGroup.append("rect")
			   	 .attr("x", 0)
	   			 .attr("y", y)
	   			 .attr("width", scope.ctrlW)
	   			 .attr("height", scope.ctrlH)
	   			 .attr("id", id)
	   			 .attr("class", "control");
	}

	
	// Activate connection mode
	scope.connMode = false;
	var activateConnMode = function(selection) {
		scope.connMode = !scope.connMode;
		if(scope.connMode) { //clicked
			d3.select("#connCtrl").attr("class", "selected-ctrl");
			d3.selectAll(".conn-point").style("display", "initial");
		}
		else { //unclicked
			d3.select("#connCtrl").attr("class", "control");
			d3.selectAll(".conn-point").style("display", "none");
		}
		//TODO might need to change
		// if(scope.nodeMode) {
		// 	scope.nodeMode = false;
		// 	d3.select("#nodeCtrl").attr("class", "control");
		// }
	}

	//TODO append them dynamically?
	// Nodes control field
	createCtrlField(0, "nodeCtrl");
	// Connections control field
	createCtrlField(80, "connCtrl")
	// Bin control field
	createCtrlField(160, "binCtrl")

	//TODO not working -- leave it or fix it?
	// d3.select("#nodeCtrl")
	//   .on("click", scope.activateNodeMode);
	d3.select("#connCtrl")
	  .on("click", activateConnMode);

	//Line accessor
	scope.line=d3.svg.line()
			   .x(function(d) {return d[0];})
			   .y(function(d) {return d[1];});

	//TODO marker end arrow is not working 
	// Model connection
	scope.modelPath = scope.svg.append("path")
						   .attr("d", scope.line([[830,100],[770,140]]))
						   // .attr("marker-end","url(#endtriangle)")
						   .attr("class", "conn");

	// TODO change to svg image
	// Wastebin image
	// scope.binImg = scope.svg.append("svg:image")
	//     .attr("xlink:href", "img/bin.jpg")
	//     .attr("width", scope.ctrlW)
	//     .attr("height", scope.ctrlH)
	//     .attr("x", 750)
	//     .attr("y",160);

	scope.workfield = scope.svg.append("rect")
						 .attr("x", 0)
						 .attr("y", 0)
						 .attr("width", scope.w - scope.ctrlW)
						 .attr("height", scope.h)
						 .attr("id", "workfield");	

}

scope.init();
