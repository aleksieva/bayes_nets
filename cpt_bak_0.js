var createCPT = function(numParents, data, idsList, level, chain){
	if (numParents === 0) {
		var lastEl = idsList[level];
		// console.log(lastEl);

		//True case - data
		var trueCase = lastEl + "T";
		data[trueCase] = 0.5;
		id1 = chain + lastEl + "T";
		// console.log(id1);
		html += '<td class="editable" id="' + id1 +'"> <input type="text" value="' + data[trueCase] + '"></td> ';

		//False case - data
		var falseCase = lastEl + "F";
		data[falseCase] = 1 - data[trueCase];
		id2 = chain + lastEl + "F";
		// console.log(id2);
		html += '<td class="editable" id="' + id2 + '"> <input type="text" value="' + data[falseCase] + '"></td>';
		d3.select("#control").append("tr").html(html);
	}
	else {
		numParents--;
		//get the element from the front of the list
		var currEl = idsList[level];
		level++;
		// console.log("current element " + currEl);

		//True case
		var temp = html;
		html += '<td>' + "T" + '</td> ';

		var tmpChain = chain;
		chain += currEl + "T->";			

		var trueCase = currEl + "T";
		data[trueCase] = {};

		//d3.select("#control").append("p").text(nodes[currEl].title + " = T");
		createCPT(numParents, data[trueCase], idsList, level, chain);			

		//False case
		html = temp;
		html += '<td>' + "F" + '</td>'		

		chain = tmpChain;
		chain += currEl + 'F->';

		var falseCase = currEl + "F";
		data[falseCase] = {};

		//d3.select("#control").append("p").text(nodes[currEl].title + " = F");
		createCPT(numParents, data[falseCase], idsList, level, chain);
	}
}

var displayCPT = function(cpt, list, level, chain) {
	//Base case
	if (level == list.length -1) {
		var lastEl = list[level];
		var chainT = chain + lastEl + 'T';
		var valT = cpt[chainT];
		console.log(valT);
		html += '<td class="editable" id="' + chainT + '"> <input type="text" value="' + valT + '" onblur="' + editTblCell() + '"></td> ';

		var chainF = chain + lastEl + 'F';
		var valF = cpt[chainF];
		console.log(valF);
		html += '<td class="editable" id="' + chainT + '"> <input type="text" value="' + valF + '" readonly></td>';
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
		html += "<td>T</td>"		
		displayCPT(cpt, list, level, chain);

		html = tmpHtml;
		chain = tmpChain;
		//False case
		chain += currEl + 'F->';
		html += "<td>F</td>"		
		displayCPT(cpt, list, level, chain);
	}
	//Error
	else {
		alert("Something unexpected happened!");
	}
}