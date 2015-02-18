var x=800,
y=40,
radius = 20,
connPointRadius = 4;

// On drag
var dragmove = function(d) {
  if(!scope.connMode) {
    var x = d3.event.x;
    var y = d3.event.y;

    d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
  }
};

//Drag behavior for circles
var drag = d3.behavior.drag()
             // .origin(function(d) {return d;})
             .on("drag", dragmove);
   //             .on("dragend", dragended);
 

var createNodeGroup = function() {
   // Ignore the click event 
   if (d3.event.defaultPrevented) return;

   if(!scope.connMode) { //TODO WHY?
      // Node model
      var newNode = scope.svg.append("g")
      .attr("transform", "translate(" + 800 + "," + 40 +")")
      .style("cursor", "pointer")
      .call(drag);              

      // New circle from the model that is going to be dragged in the workspace
      var newCircle = newNode.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 20)
      .attr("class", "node")
      .on("mousedown", createNodeGroup);

      var newRectGroup = newNode.append("g");

      newRectGroup.append("circle")
      .attr("r", connPointRadius)
      .attr("class", "conn-point")
      .attr("transform", "translate(0,-20)")
      .on("mousedown", scope.startLineDraw);

      newRectGroup.append("circle")
      .attr("r", connPointRadius) 
      .attr("class", "conn-point")
      .attr("transform", "translate(20,0)")
      .on("mousedown", scope.startLineDraw);

      newRectGroup.append("circle")
      .attr("r", connPointRadius)
      .attr("class", "conn-point")
      .attr("transform", "translate(0,20)")
      .on("mousedown", scope.startLineDraw);

      newRectGroup.append("circle")
      .attr("r", connPointRadius)
      .attr("class", "conn-point")
      .attr("transform", "translate(-20,0)")
      .on("mousedown", scope.startLineDraw);
    }
}

var initNode = scope.svg.append("g")
                   .attr("transform", "translate(" + x + "," + y +")")
                   .style("cursor", "pointer")
                   .call(drag);              

// New circle from the model that is going to be dragged in the workspace
var initCircle = initNode.append("circle")
                       .attr("cx", 0)
                       .attr("cy", 0)
                       .attr("r", 20)
                       .attr("class", "node")
                       .on("mousedown", createNodeGroup);

var initRectGroup = initNode.append("g");

initRectGroup.append("circle")
            .attr("r", connPointRadius)
            .attr("class", "conn-point")
            .attr("transform", "translate(0,-20)")
            .on("mousedown", scope.startLineDraw);

initRectGroup.append("circle")
            .attr("r", connPointRadius) 
            .attr("class", "conn-point")
            .attr("transform", "translate(20,0)")
            .on("mousedown", scope.startLineDraw);

initRectGroup.append("circle")
           .attr("r", connPointRadius)
           .attr("class", "conn-point")
           .attr("transform", "translate(0,20)")
           .on("mousedown", scope.startLineDraw);

initRectGroup.append("circle")
             .attr("r", connPointRadius)
             .attr("class", "conn-point")
             .attr("transform", "translate(-20,0)")
             .on("mousedown", scope.startLineDraw);



