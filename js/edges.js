var createNewEdge = function(sourceNode, targetNode) {
	//create a new edge
	var newEdge = {source:sourceNode, target:targetNode};
	var duplicates = edges.filter(function(e){
		//check if there is an edge in the opposite direction
		//i.e an edge with reverse target and source to the new edges
		//if so -> remove it
		if(newEdge.target === e.source && newEdge.source === e.target) {
			edges.splice(edges.indexOf(e),1);
			//recalculate this node cpt as this edge has been deleted
			recalculateCPT([e], e.source);
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
};

//code taken from this example http://bl.ocks.org/cjrd/6863459
var removeIncidentEdges = function(node) {
	var edgesToDelete = edges.filter(function(e) {
		return (e.source === node || e.target === node);
	});

	edgesToDelete.map(function(e) {
		edges.splice(edges.indexOf(e), 1);
	});

	return edgesToDelete;
};

var edgeMenu = [
	{
		title: 'Remove Connection',
		action: function(elm, d, i) {
			deleteEdge(d);
		}
	}
]

var deleteEdge = function(path) {
	edges.splice(edges.indexOf(path), 1);
	//recalculate the cpt of the target node of this edge
	recalculateCPT([path], path.source);
	//update the view
	refresh();		
}