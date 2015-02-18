svg.append("rect")
   .attr("x", 840)
   .attr("y", 0)
   .attr("width", 80)
   .attr("height", 75)
   .attr("class", "control");

svg.append("circle")
   .attr("x", 0)
   .attr("y", 0)
   .attr("r", r)
   .attr("class", "node")
   .attr("transform", "translate(880, 37.5)");

svg.append("rect")
   .attr("x", 840)
   .attr("y", 75)
   .attr("width", 80)
   .attr("height", 75)
   .attr("class", "control");

svg.append("path")
   .attr("d", "M850,135L900,95")
   .style("marker-end", "url(#arrow)")
   .attr("class", "conn");

svg.append("rect")
   .attr("x", 840)
   .attr("y", 150)
   .attr("width", 80)
   .attr("height", 75)
   .attr("class", "control");

svg.append("rect")
   .attr("x", 840)
   .attr("y", 225)
   .attr("width", 80)
   .attr("height", 75)
   .attr("class", "control");

svg.append("rect")
   .attr("x", 840)
   .attr("y", 300)
   .attr("width", 80)
   .attr("height", 75)
   .attr("class", "control");

svg.append("rect")
   .attr("x", 840)
   .attr("y", 375)
   .attr("width", 80)
   .attr("height", 75)
   .attr("class", "control");