var createCPT = function(data, idsList, level, chain) {
	if (level === idsList.length-1) {
		var lastEl = idsList[level];

		//True case - data
		var trueCase = chain + lastEl + "T";
		data[trueCase] = 0.5;

		//False case - data
		var falseCase = chain + lastEl + "F";
		data[falseCase] = 1 - data[trueCase];
	}
	else if(level < idsList.length-1) {
		//get the element from the front of the list
		var currEl = idsList[level];
		level++;

		var tmpChain = chain;
		//True case
		chain += currEl + "T->";
		createCPT(data, idsList, level, chain);			

		chain = tmpChain;
		//False case
		chain += currEl + "F->";
		createCPT(data, idsList, level, chain);
	}
	else {
		alert("Something unexpected has happened!")
	}
}

var displayCPT = function(cpt, list, level, chain) {
	//Base case
	if (level == list.length -1) {
		var lastEl = list[level];
		var chainT = chain + lastEl + 'T';
		var valT = cpt[chainT];
		// console.log(valT);
		html += '<td class="editable"> <input type="text" id="' + chainT + '" value="' + valT + '"></td> ';

		var chainF = chain + lastEl + 'F';
		var valF = cpt[chainF];
		// console.log(valF);
		//TODO make it readonly
		// html += '<td class="editable"> <input type="text" id="' + chainF + '"value="' + valF + '" readonly></td>';
		html += '<td class="editable"> <input type="text" id="' + chainF + '"value="' + valF + '"></td>';		
		d3.select(".cptTable").append("tr").html(html);

	}
	//Recursive case
	else if (level < list.length -1) {
		var currEl = list[level];
		level++;

		var tmpHtml = html;
		var tmpChain = chain;
		//True case
		chain += currEl + 'T->';
		html += "<td>T</td>";
		displayCPT(cpt, list, level, chain);

		html = tmpHtml;
		chain = tmpChain;
		//False case
		chain += currEl + 'F->';
		html += "<td>F</td>";
		displayCPT(cpt, list, level, chain);
	}
	//Error
	else {
		alert("Something unexpected happened!");
	}
}


//update table values when edited
var updateTbl = function(){
	var tblId = d3.select(".cptTable").attr("id");
	if(!tblId) {
		alert ("Table does not exist.")
	}
	// console.log(tblId);

	currCpt = nodes[tblId].tbl;
	if(!currCpt){
		alert("The CPT for this nodes cannot be accessed.");
	}

	// console.log(currCpt);

	cells = d3.selectAll("td.editable")
			  .selectAll("input")
			  .each(function(d, i) {
			  	// var newValue = this.value;

			  	path = this.id.split("->");
			  	// console.log(path);
			  	var nestedCpt = currCpt;
			  	//get to the last level of the cpt
			  	for (var p=0; p<path.length-1; p++) {
			  		nestedCpt = currCpt[path[i]];
			  	}
			  	if(isValidCPTEntry(this.value)) {
//			  	}
			  });
}


//update table values when edited
var updateTbl = function(){
	var tblId = d3.select(".cptTable").attr("id");
	if(!tblId) {
		alert ("Table does not exist.")
	}
	// console.log(tblId);

	currCpt = nodes[tblId].tbl;
	if(!currCpt){
		alert("The CPT for this nodes cannot be accessed.");
	}

	// console.log(currCpt);

	cells = d3.selectAll("td.editable")
			  .selectAll("input")
			  .each(function(d, i) {
			  	// console.log(this);
			  	// console.log("old value");			  	
			  	// console.log(currCpt[this.id]);
			  	// console.log(this.value);
			  	var newValue = this.value;
			  	if(isValidCPTEntry(newValue)) {
			  		currCpt[this.id] = newValue;
			  	}
			  	// console.log("new value");
			  	// console.log(currCpt[this.id]);
			  });
}