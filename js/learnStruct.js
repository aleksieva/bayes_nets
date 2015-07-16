//main function to handle the structure learning workflow
var learnStructure = function() {
	// if data has not been uploaded, warn the user 
	if (!csvData || !fData) {
		bootbox.dialog({
			message: "Import a CSV dataset before trying to learn the parameters.",
			buttons: {
				main: {
				label: "OK",
				className: "btn-bayes-short",
				},
			}
		});	
	}
	else {
		//learn the structure
	}
}

//initialise fully connected graph
var initialiseAdjacencyMatrix = function() {
	var adjMat = [];
	for(var i=0; i<nodes.length; i++) {
		adjMat[i] = [];
		for(var j=0; j<nodes.length; j++) {
			console.log(i, j);
			if(i !== j) {
				adjMat[i][j] = 1;
			}
			else {
				adjMat[i][j] = 0;
			}
		}
	}
}

// get neighbours of a node from the current state of the adjacency matrix
var getNeighboursAdjMat = function() {
	
}