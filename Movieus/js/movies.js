//Fonctions qui vont servir quand je vais faire des statistiques sur les films

function actorCount() {
	var actors = concatArrays(movies.map(function(x){return x.actors}));
	return countDuplicate(actors).filter(function(x){return x.count>1}).sort(function(a,b){return b.count-a.count;});
}
function yearCount(){
	return countDuplicate(movies.map(function(x){return x.year;}).sort());
}
function concatArrays(arrays){
	return [].concat.apply([], arrays);
}


function ratingStats(numberOfColumn){
	if (numberOfColumn>movies.length){
		console.error("The number of column must of lower than the number of movies you have");
		return;
	}
	var data = movies.map(function(x){return {rating: x.rating, year: x.year}}).sort(function(a,b){return a.year-b.year});
	var n = (data.length/numberOfColumn)|0;
	var stats = [];
	var temp = [];
	for(var i=0;i<data.length;i++){
		if (i%n===0&&i>0){
			stats.push({range: temp[0].year + "-" + temp[temp.length-1].year,stats:Math.round((temp.reduce(function (a, b) { return a + b.rating; }, 0)/n)*10)/10});
		}
		temp[i%n] = data[i];
	}
	return stats;
}

function uniqueArray(array){
	array = array.sort();
	var unique = [];
	var temp;
	for (var i = 0; i<array.length; i++){
		if (temp!==array[i]){
			unique.push(array[i]);
		}
		temp = array[i];
	}
	return unique;
}

function countDuplicate(array){
	array = array.sort();
	var unique = [];
	var temp;
	for (var i = 0; i<array.length; i++){
		if (temp===array[i]){
			unique[unique.length-1].count++;
		}
		else{
			unique.push({value:array[i],count:1});
			temp = array[i];
		}		
	}
	return unique;
}

function moviesTitle(){
	var textArea = document.createElement("textarea");
	textArea.value = movies.map(function(x){return x.title}).join("\n");
	document.body.appendChild(textArea);
}

//http://imdbapi.betaeasy.com/thread/23139
function correctMovieTitle(){
	var regex = new RegExp("\"(\\w|\\s|:|\\-){0,}", "m");
	for(var i=0;i<movies.length;i++){
		if(regex.test(movies[i].title)){
			console.warn(movies[i].title);
			movies[i].title = movies[i].title.match(regex)[0].slice(1);
		}
	}
}
function hideSpecificMovie(fileName){
	hiddenMovies = hiddenMovies.concat(movies.separateArray(function(x){return x.fileName!==fileName;}));
	grid.refreshData(movies);
}

Array.prototype.separateArray = function(predicate){
	var notValid = [];
	var valid = [];
	for(var i = 0;i<this.length;i++){
		if (predicate(this[i])){
			valid.push(this[i]);
		}
		else{
			notValid.push(this[i]);
		}
	}
	this.length = 0;
	for(var i = 0;i<valid.length;i++){
		this.push(valid[i]);
	}
	return notValid;
}
window.onbeforeunload = function(){
	localStorage["hide"] = JSON.stringify(hiddenMovies.map(function(x){return x.fileName;}));
}
function createMoviesGrid() {
    //Ça serait vraiment cool permettre à l'usager de selectionner ses propres colonnes
	var columns = 	[
						{id:'Poster', type: 'img', attributes: {src:function(x){return (x.Poster?x.Poster:"http://ia.media-imdb.com/images/G/01/imdb/images/nopicture/large/film-184890147._V379391879_.png");}}},
						{ id: 'Title', type: 'a', search: true, attributes: { href: function (x) { return "http://www.imdb.com/title/" + x.imdbID }, innerHTML: function (x) { return x.Title } } },
						{ id: 'Plot', type: 'text', search: true },
						{ id: 'Actors', type: 'text', search: true },
						{ id: 'Genre', type: 'text', search: true, searchList: uniqueArray(concatArrays([].map(function (x) { return x.genres }))) },
						{ id: 'Director', type: 'text', search: true },
						{ id: 'imdbRating', type: 'text', order: true },
						{id:'Year', type: 'text', order:true},
						{id:'hide', type: 'button', attributes: {innerHTML:function(x){return 'hide'},onclick:function(x){return function(){hideSpecificMovie(x.fileName);}}}}
					];
	var grid = $("#movieTable").brunoGrid({ columns: columns, data: [], sortBy: { id: 'rating', reverse: true } });
	return grid;
}
/*TODO: 
Graph sur les années, les acteurs, etc (page statistique)
Langue du film
Faire en sorte que les noms du film fonctionne en francais et en anglais
Pagination
*/