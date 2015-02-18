var startPt,
	path,
	isDrawing = false;

scope.startLineDraw = function(d) {
	if (scope.connMode) {
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
			path = scope.svg.append("path")
					.attr("d", scope.line([startPt, startPt]))
					.attr("class", "conn")
					.style("cursor", "pointer");
					// .call(drag);
			// console.log("First element", selection.attr("cx"), selection);
		}				
	}
} 

scope.svg.on("mouseup", function() {
	if(isDrawing) {
		isDrawing=false;
	}
});
scope.svg.on("mousemove", function(d) {
	if (isDrawing) {
		// var newLine = scope.line([startPt, d3.mouse(svg.node())])
		// console.log(d3.mouse(svg.node()));
		console.log(d3.mouse(this));
		// console.log(newLine)
		path.attr("d", scope.line([startPt, d3.mouse(this)]));
	}
});