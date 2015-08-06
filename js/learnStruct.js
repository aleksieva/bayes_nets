// adjacency matrix
var adjMat;
// independencyMatrix
var indepMat;
// matrix to track whether this pair has already been checked at this round
var pairMat;

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
		// clear all connections
		edges = [];
		// initialise the adjacency matrix
		initialiseAdjacencyMatrix();
		// initialise the independency matrix
		initialiseIndepMatrix();
		// set p(X=x) for all nodes
		preliminaryProbabilities();
		//learn the structure
		console.time("skeleton learning");
		PCSkeletonLearning();
		console.timeEnd("skeleton learning");
		// learn the orientation
		PCOrientation();
		// build the resulting structure
		createConnsFromAdjMatrix();

		// add force layout
		// forceLayout(nodes, edges);
		// refresh();

		//success message
		var successDiv = control.insert("div", "h3.node-label")
								.attr("class", "alert-text alert alert-success");
		successDiv.append("span")
				 	.attr("class", "glyphicon glyphicon-ok")
					.attr("aria-hidden", "true");
		successDiv.append("span")
					.attr("class", "sr-only")
					.text("Success");
		var text = successDiv.html() + " Network structure has been successfully learnt.";
		successDiv.html(text);

		//remove after 3 seconds
		setTimeout(removeAlertMsg, 3000);		
	}
}

//initialise fully connected graph
// no self-loops
var initialiseAdjacencyMatrix = function() {
	adjMat = [];
	for(var i=0; i<nodes.length; i++) {
		adjMat[i] = [];
		for(var j=0; j<nodes.length; j++) {
			if(i !== j) {
				adjMat[i][j] = 1;
			}
			else {
				adjMat[i][j] = 0;
			}
		}
	}
}

// initialise the independency matrix
var initialiseIndepMatrix = function() {
	indepMat = [];
	for(var i=0; i<nodes.length; i++) {
		indepMat[i] = [];
		for(var j=0; j<nodes.length; j++) {
			indepMat[i][j] = null;
		}
	}
}

// initialise pair matrix
var initialisePairMatrix = function() {
	pairMat = [];
	for(var i=0; i<nodes.length; i++) {
		pairMat[i] = [];
		for(var j=0; j<nodes.length; j++) {
			if(i !== j) {
				pairMat[i][j] = 0;
			}
			else {
				pairMat[i][j] = 1;
			}
		}
	}
}

// get neighbours of a node from the current state of the adjacency matrix
var getNeighboursAdjMat = function(node) {
	var neighbours = [];
	var nodeIndex = nodes.indexOf(node);
	var nodeRow = adjMat[nodeIndex];
	for(var cell in nodeRow) {
		if(nodeRow[cell] == 1) {
			// then this is a neighbour of node
			neighbours.push(cell);
		}
	}
	return neighbours;
}

// get symmetric neighbours of a node from the current state of the adjacency matrix
var getSymNeighAdjMat = function(node) {
	var symNeighs = [];
	var index = nodes.indexOf(node);
	for (var cell in adjMat[index]) {
		if(adjMat[index][cell] == 1 && adjMat[cell][index] == 1) {
			symNeighs.push(cell);
		}
	}
	return symNeighs;
}

// check if a node has in links
var hasInLinks = function(node) {
	var inLinks = [];
	var index = nodes.indexOf(node);
	for (var cell in adjMat[index]) {
		if(adjMat[cell][index] == 1) {
			return true;
		}
	}
	return false;
}
// remove a connection between two nodes
// symmetric and unsymmetric option
var removeConnAdjMatrix = function(source, target, option) {
	var sourceIndex = nodes.indexOf(source);
	var targetIndex = nodes.indexOf(target);
	// only unsymmetric
	adjMat[sourceIndex][targetIndex] = 0
	if (option === "symmetric") {
		adjMat[targetIndex][sourceIndex] = 0;
	}
}

//create connections based on the adjacency matrix state
var createConnsFromAdjMatrix = function() {
	for(var row in adjMat) {
		var sourceNode = nodes[row];
		// console.log(sourceNode);
		for(var cell in adjMat[row]) {
			var targetNode = nodes[cell];
			// console.log(targetNode);
			// console.log("cell value: " + adjMat[row][cell]);
			if(adjMat[row][cell]) {
				createNewEdge(sourceNode, targetNode);
			}
		}
	}
	// update the display
	refresh();
}

// stores the probability p(X=x) for each node, for each of its values
// to be used in the independence test (unconditional case)
var preliminaryProbabilities = function() {
	for (var node in nodes) {
		nodes[node].probValues = {};
		var values = nodes[node].values;
		for(var value in values) {
			// var numOccurrences = nodes[node].csvData.filter(function(cell){
			// 	return cell == values[value];
			// }).length;
			var numOccurrences = _.filter(csvData, function(row) {
				return row[nodes[node].title] == values[value];
			}).length;
			nodes[node].probValues[values[value]] = numOccurrences / csvData.length;
		}
	}
}

// calculate unconditional mutual information
var mi = function(x, y) {
	var mutInf = 0;
	for (xVal in x.values) {
		for (yVal in y.values) {
			// calculate the joint probablity p(X=x,Y=y)
			// console.time("indexes intersection");
			// // var indexes =[];
			// var indexesX = [];
			// x.csvData.forEach(function(cell, i) {
			// 	if(cell == valuesX[xVal]) {
			// 		// indexes.push(i);
			// 		indexesX.push(i);
			// 	}
			// });
			// // y.csvData.forEach(function(cell, i) {
			// // 	if(cell !== valuesY[yVal] && _.contains(indexes, i)) {
			// // 		indexes.splice(indexes.indexOf(i), 1);
			// // 	}
			// // });
			// var indexesY = [];
			// y.csvData.forEach(function(cell, i){
			// 	if(cell == valuesY[yVal]) {
			// 		indexesY.push(i);
			// 	}
			// })
			// var jointOccurrences = _.intersection(indexesX, indexesY).length;
			// console.timeEnd("indexes intersection");
			// var pXY = jointOccurrences / x.csvData.length;
			// pXY = indexes.length / x.csvData.length;
			var jointOccurrences = _.filter(csvData, function(row) {
				return row[x.title] == x.values[xVal] && row[y.title] == y.values[yVal];
			}).length;
			var pXY = jointOccurrences / csvData.length;
			// calculate this round
			// TODO add pseudo counts
			var val;
			if(pXY != 0) {
				val = pXY * Math.log(pXY / (x.probValues[x.values[xVal]] * y.probValues[y.values[yVal]]));
			}
			else {
				val = 0;
			}
			mutInf += val;
		}
	}
	return mutInf;	
}

// calculate conditional mutual information recursively
// var condMI = function(counter, x, y, set, csvZ) {
var condMI = function(counter, x, y, set, filterObj) {	
	var sum = 0;
	// base case
	// all z values are fixed -> loop through x and y possible values
	if (counter == set.length) {
		// var xValues = x.values;
		// var yValues = y.values;

		// calculate Nz
		// var Nz = _.where(csvData, filterObj).length; 
		var csvZ = _.where(csvData, filterObj);

		for (var xVal in x.values) {
			// add x and its value to a new object
			var xObj = {};
			// _.extend(xObj, filterObj);
			xObj[x.title] = x.values[xVal];
			// calculate Nxz
			// var Nxz = _.where(csvData, xObj).length;
			var Nxz = _.where(csvZ, xObj).length;

			for (var yVal in y.values) {
				// Nxz = _.filter(csvZ, function(row){
				// 	return row[x.title] === x.values[xVal];
				// });
				// Nyz = _.filter(csvZ, function(row){
				// 	return row[y.title] === y.values[yVal];
				// });
				// Nxyz = _.intersection(Nxz, Nyz);


				// add y and its value to the filter object
				xObj[y.title] = y.values[yVal];
				// calculate Nxyz
				// var Nxyz = _.where(csvData, xObj).length;
				var Nxyz = _.where(csvZ, xObj).length;
				// add y and its value to new obj
				var yObj = {};
				// _.extend(yObj, filterObj);
				yObj[y.title] = y.values[yVal];
				// calculate Nyz
				// var Nyz = _.where(csvData, yObj).length;
				var Nyz = _.where(csvZ, yObj).length;

				// calculate the value for this round
				// deal with 0s 
				if(Nxyz === 0) {
					// TODO pseudo counts
					var valRound = 0;
				}
				else {
					// var valRound = (Nxyz / csvData.length) * Math.log((Nxyz * Nz)/(Nxz * Nyz));
					var valRound = (Nxyz / csvData.length) * Math.log((Nxyz * csvZ.length)/(Nxz * Nyz));					
				}
				// console.log("value: " + valRound);
				sum += valRound;
			}
		}
	}
	else if (counter < set.length) {
		// get current z 
		var currZ = nodes[set[counter]];
		// console.log(currZ);
		counter ++;
		for (var val in currZ.values) {
			// var newCsvZ = _.filter(csvZ, function(row){
			// 	return row[currZ.title] === currZ.values[val];
			// })
			// var partSum = condMI(counter, x, y, set, newCsvZ);

			// create new object to hold the value of this iteration of current z
			var currFilterObj = {};
			_.extend(currFilterObj, filterObj);
			// add z title and value to the object
			currFilterObj[currZ.title] = currZ.values[val];
			// go to the next level
			var partSum = condMI(counter, x, y, set, currFilterObj);

			sum += partSum;
		}
	}
	else {
		console.log("Something unexpected happened. Recursive mutual information - wrong counter.")
	}
	return sum;
}

// test whether x and y are (un)conditionally independent
// if set is [], then the unconditional case
var independenceTest = function(x, y, set) {
	// var mutInf = mutInfRecurs(0, x, y, set, csvData);
	// console.log(mutInf);
	// return 0;
	// var valuesX = x.values;
	// var valuesY = y.values;
	var mutInf = null;	
	var degreesOfFreedom = Math.abs(x.values.length -1) * Math.abs(y.values.length-1);
	var alpha = 0.05;
	var criticalValue = null;


	//unconditional independence case
	if (set.length == 0) {
		criticalValue = chisqrdistr(degreesOfFreedom, alpha);
		// unconditional mutual information
		mutInf = mi(x,y);
	}
	// conditional independence test
	else {
		// calculate degrees of freedom
		// TODO check
		var zSumVals = 1;
		for (var z in set) {
			zSumVals *= nodes[set[z]].values.length;
		}
		degreesOfFreedom = degreesOfFreedom * zSumVals;
		criticalValue = chisqrdistr(degreesOfFreedom, alpha);

		mutInf = condMI(0, x, y, set, {});
		// mutInf = condMI(0, x, y, set, csvData);
	}

	var gStatistic = 2 * csvData.length * mutInf;
	// console.log(mutInf);
	// console.log("gStatistic: " + gStatistic);
	return gStatistic < criticalValue;
}

// check whether the PC skeleton learning should terminate
var neighboursSetSize = function(size) {
	var flag = 0;
	for (var node in nodes) {
		if(getNeighboursAdjMat(nodes[node]).length > size) {
			flag = 1;
		}
	}
	return flag;
}

var PCSkeletonLearning = function() {
	var i = 0
	//continue until all nodes have neighbourhood size less than i
	while(neighboursSetSize(i)) {
		console.log("ROUND: " + i);
		// initialise pair matrix
		initialisePairMatrix();
		// for each node
		for (var node in nodes) {
			// get the node neighbours
			var neighbours = getNeighboursAdjMat(nodes[node]);
			//for each pair node-neighbour
			for (var neigh in neighbours) {
				// check if this pair has already been checked and if this is the first round
				// if(i==0 && pairMat[node][neighbours[neigh]] == 0) {
				if (i==0) {
					// break;
					if(pairMat[node][neighbours[neigh]] == 0) {
						console.log("Pair nodes: " + node + " " + neighbours[neigh]);
	
						// set this pair as checked for this round
						pairMat[node][neighbours[neigh]] = 1;
						pairMat[neighbours[neigh]][node] = 1;
	
					// unconditional independence
					//check if this is the first round				
					// if(i==0) {
						// console.time("independence");
						var independent = independenceTest(nodes[node], nodes[neighbours[neigh]], []);
						console.log("Independent: ", independent);
						// console.timeEnd("independece");
						if(independent) {
							// keep the empty set in the independence Matrix
							// setValueIndepMatrix(nodes[node], nodes[neighbours[neigh]], combo);
							indepMat[node][neighbours[neigh]] = [];
							indepMat[neighbours[neigh]][node] = [];
							// remove the link between these nodes symmetrically
							removeConnAdjMatrix(nodes[node], nodes[neighbours[neigh]], "symmetric");
						}
					}
				}
				// conditional independence
				else {
					console.log("Pair nodes: " + node + " " + neighbours[neigh]);

					// get the whole set of other node's neighbours
					var wholeSet = neighbours.filter(function(n) {
						return n !== neighbours[neigh];
					});
					// get all possible combinations in the set of size i
					var combos = k_combinations(wholeSet, i);
					console.log("combos: " + combos);
					// for each combination
					for (var combo in combos) {
						// test for independence
						// console.time("conditional independence");
						var independent = independenceTest(nodes[node], nodes[neighbours[neigh]], combos[combo]);
						console.log("Independent: ", independent);
						// console.timeEnd("conditional independence");
						if(independent) {
							// if result is that they are conditionally independent
							// keep the set that they are independent on in the independency matrix
							// setValueIndepMatrix(nodes[node], nodes[neighbours[neigh]], combo);
							indepMat[node][neighbours[neigh]] = _.union(indepMat[node][neighbours[neigh]], combos[combo]);
							indepMat[neighbours[neigh]][node] = _.union(indepMat[node][neighbours[neigh]], combos[combo]);							
							// remove the link between these nodes symmetrically
							removeConnAdjMatrix(nodes[node], nodes[neighbours[neigh]], "symmetric");						
						}
					}	
				}
			}
		}
		i++;
	}
}

var unmarriedCollider = function() {
	// initialise pair matrix
	initialisePairMatrix();

	// for each pair of nodes -> no repetition
	for (var n1 in nodes) {
		for (var n2 in nodes) {
			if(pairMat[n1][n2] !== 1) {
				// update the pair mat
				pairMat[n1][n2] = 1;
				pairMat[n2][n1] = 1;
				// get symmetric neighbours of each node
				// var neigh1 = getNeighboursAdjMat(nodes[n1]);
				// var neigh2 = getNeighboursAdjMat(nodes[n2]);
				var neigh1 = getSymNeighAdjMat(nodes[n1]);
				var neigh2 = getSymNeighAdjMat(nodes[n2]);

				var commonNeighs = _.intersection(neigh1, neigh2);
				for (var c in commonNeighs) {
					if(!_.contains(indepMat[n1][n2], commonNeighs[c])) {
						var source = nodes[commonNeighs[c]];
						removeConnAdjMatrix(source, nodes[n1], "unsymmetric");
						removeConnAdjMatrix(source, nodes[n2], "unsymmetric");	
					}
				}
			}
		}
	}
}

// x → z − y ⇒ x → z → y
var orientedGrandParent = function() {
	for (var n in nodes) {
		// check if a node has any inlinks
		if(hasInLinks(nodes[n])) {
			// check if a node has any unorientated edges
			var symNeighs = getSymNeighAdjMat(nodes[n]);
			// orientate the unorientated edges to be outlinks from the current node
			for (var sn in symNeighs) {
				removeConnAdjMatrix(nodes[symNeighs[sn]], nodes[n], "unsymmetric");
			}
		}
	}
}

var PCOrientation = function() {
	// unmarried collider rule
	unmarriedCollider();
	// orient a node to be a child if grandparent is oriented
	// x → z − y ⇒ x → z → y
	orientedGrandParent();
}