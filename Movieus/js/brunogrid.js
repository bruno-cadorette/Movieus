jQuery.fn.extend({
	brunoGrid: function(params){
		return new brunoGrid(params, this);
	}
});

function brunoGrid(params, target){
		this.target = target[0];
		this.graphicSort = { true:"\\/", false:"/\\"}
		this.data = params.data;
		this.sortBy=params.sortBy;
		this.columns = params.columns;
		this.generateHeader();
		this.generateBody();
		return this;
	}
//Génère l'entête à partir de la liste de champ. Cette fonction assigne aussi les fonctions de recherche
brunoGrid.prototype.generateHeader = function () {
	var $tr = document.createElement("tr");
	var self = this;
	for(var i = 0;i<this.columns.length;i++){
		var $th = document.createElement("th");
		if (this.columns[i].search){
			if(this.columns[i].searchList){
				var searchDropDown = document.createElement("select");
				searchDropDown.id = this.columns[i].id;
				searchDropDown.className  = "filter";
				searchDropDown.appendChild(document.createElement("option"));
				for(var j=0;j<this.columns[i].searchList.length;j++){
					var option = this.columns[i].searchList[j];
					var opt = document.createElement("option");
					opt.textContent = option;
					opt.value =option;
					searchDropDown.appendChild(opt);
					$th.appendChild(searchDropDown);
				}
			}
			else{
				var searchInput = document.createElement("input");
				searchInput.id = this.columns[i].id;
				searchInput.className  = "filter";
				$th.appendChild(searchInput);
			}
		}
		if (this.columns[i].order){
			var orderButton = document.createElement("button");
			orderButton.id = this.columns[i].id;
			orderButton.className  = "order";
			if (this.sortBy.id===orderButton.id){
				orderButton.innerHTML = this.graphicSort[this.sortBy.reverse];
			}
			else{
				orderButton.innerHTML = "-";
			}
			$th.appendChild(orderButton);
		}
		$tr.appendChild($th);
	}
	this.target.appendChild($tr);
	$("input.filter").keyup(function (){ self.search();});
	$("select.filter").change(function (){ self.search();});
	$(".order").click(function(e){self.orderBy(e);});
}

brunoGrid.prototype.orderedTable = function (filter) {
    //L'ordre, ascendant ou descendant
	var orderFunction = {true: -1,false:1};
	var self = this;
    //Array.toString().indexOf est plus rapide que parcourir le tableau en faisant indexOf
	return this.data
		.filter(function(a){return typeof filter==="undefined" || filter.every(function(x){return x.value==="" || a[x.id].toString().toLowerCase().indexOf(x.value)!==-1;})})
		.sort(function(a,b){return (a[self.sortBy.id]-b[self.sortBy.id])*orderFunction[self.sortBy.reverse]});
}

brunoGrid.prototype.generateBody = function(filter){
	var target = this.target;
	var columns = this.columns;

	this.orderedTable(filter).forEach(function(item){
		var $tr = document.createElement("tr");
		columns.forEach(function(column){
			var $td = document.createElement("td");
			if (column.type!=="text"){
				var element = document.createElement(column.type);
				//Met les valeurs des attributs avec une fonction de projection
				for(var attr in column.attributes){
					element[attr] = column.attributes[attr](item);
				}
				$td.appendChild(element);
			}
			else{
				$td.innerHTML = item[column.id];
			}
			$tr.appendChild($td);
		});
		target.appendChild($tr)
	});
};


brunoGrid.prototype.search = function(){
	$(this.target).find("tr:gt(0)").remove();
	this.generateBody($(".filter").map(function(i,x){return {id:x.id, value : x.value.toLowerCase()};}).toArray());
}

brunoGrid.prototype.refreshData = function(data){
	this.data = data;
	this.search();
}


brunoGrid.prototype.addRow = function (x) {
    this.data.push(x);
    this.search();
}

brunoGrid.prototype.orderBy = function(e){
	var id = e.target.id;
	if (this.sortBy.id === id){
		this.sortBy.reverse = !this.sortBy.reverse;
	}
	else{
		this.sortBy.id = id;
	}
	$(".order").html("-");
	$("#"+id).html(this.graphicSort[this.sortBy.reverse]);
	this.search();
}