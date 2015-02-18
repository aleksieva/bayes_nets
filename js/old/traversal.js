var getEnterTraversalNodes = function(){
	var enterNodes = []
	for(n in nodes) {
		var inEdges = edges.filter(function(e) {
			return e.target === nodes[n];
		})
		if (inEdges.length === 0) {
			enterNodes.push(nodes[n].id);
		}
	}
	console.log(enterNodes);
	return enterNodes;
};

var buildAdjacencyList = function(){
	adjList = {};
	for (n in nodes) {
		adjList[nodes[n].id] = [];
		var incidentEdges = edges.filter(function(e) {
			return e.source === nodes[n]
		})
		for (iE in incidentEdges) {
			adjList[nodes[n].id].push(incidentEdges[iE].target.id);
		}
	}
	console.log(adjList);
	return adjList;
}

var traverseGraph = function() {
	//get initial nodes
	var enterNodes = getEnterTraversalNodes();
	//get adjList of the graph
	var adjList = buildAdjacencyList();
	//mark all nodes as not visited
	var visited = {}
	for (n in nodes){
		visited[nodes[n].id] = false;
	}

	//state of stack - shows which nodes are on the stack
	var nodesOnStack = {}
	for(n in nodes) {
		nodesOnStack[nodes[n].id] = false;
	}
	for(eN in enterNodes) {
		nodesOnStack[enterNodes[eN]] = true;
	}

	while(enterNodes.length !== 0) {
		//Note that v is the index of the node, not the object itself
		//shift get elements from the front
		var v = enterNodes.shift();
		nodesOnStack[v] = false;
		if(!visited[v]) {
			visited[v] = true;
			targetNodes = adjList[v];
			for (tN in targetNodes){
				console.log("visiting " + targetNodes[tN] + " from " + v);
				if(!visited[targetNodes[tN]] && !nodesOnStack[targetNodes[tN]]) {
					enterNodes.unshift(targetNodes[tN]);
					nodesOnStack[targetNodes[tN]] = true;
				}
			}
		}
	}

	console.log(visited);
};
