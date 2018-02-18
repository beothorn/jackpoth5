var runnersElement = document.getElementById("runners");
var configElement = document.getElementById("config");
var canvasParentElement = document.getElementById("canvas-container");
var prizesElement = document.getElementById("prizes");
var loadingElement = document.getElementById("loading");
var playElement = document.getElementById("playButton");
var countdownElement = document.getElementById("countdown");

playElement.style.display="none";

var gameOptions = {};

function getSearchParameters() {
      var prmstr = window.location.search.substr(1);
      return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

function urlHasSeed(){
	console.log(document.URL);
	return false;
}


function getSeedFromUrl(){
	return "foo";
}

playElement.onclick = function(){
 
  gameOptions.players = runnersElement.value.split('\n').sort().filter(
		function (value, index, self) { 
    		return self.indexOf(value) === index;
		}
	);
	
	configElement.style.display="none";
  canvasParentElement.style.display="flex";
	
	var dateNow = Date.now()+"";
	var seed = dateNow.substr(dateNow.length-3,dateNow.length);
	
	if(urlHasSeed()){
    seed = getSeedFromUrl();
	}else{
	}
		
	gameOptions.seed = seed;
	
	gameOptions.generationInterval = 5;
	gameOptions.ballSpeed = 5;
	gameOptions.prizes = prizesElement.value;
	gameOptions.countdown = countdownElement.value;
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	setCanvasContextDefaultValues();
		
	var stateObject = {}; 
	var title = "Game";
	  var newUrl = "?seed="+seed+"&prizes="+gameOptions.prizes+"&players="+gameOptions.players.join(",");
	history.pushState(stateObject,title,newUrl);
	
	window.addEventListener('popstate', function(event) {
		var params = getSearchParameters();
  		console.log(params); 
	}); 
	
    start();
}

function gameStopped(){
    configElement.style.display="block";
	canvas.style.display="none";
}
