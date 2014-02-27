var runnersElement = document.getElementById("runners");
var configElement = document.getElementById("config");
var generationIntervalElement = document.getElementById("generationInterval");
var ballSpeedElement = document.getElementById("ballsSpeed");
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

function getWidthFromUrl(){
	return 800;
}

function getHeightFromUrl(){
	return 600;
}

playElement.onclick = function(){
 
    gameOptions.players = runnersElement.value.split('\n').sort().filter(
		function (value, index, self) { 
    		return self.indexOf(value) === index;
		}
	);
	
	configElement.style.display="none";
	canvas.style.display="block";
	
	var dateNow = Date.now()+"";
	var seed = dateNow.substr(dateNow.length-3,dateNow.length);
	
	if(urlHasSeed()){
	    seed = getSeedFromUrl();
	    context.canvas.width  = getWidthFromUrl();
		context.canvas.height = getHeightFromUrl();
	}else{
	    context.canvas.width  = window.innerWidth;
		context.canvas.height = window.innerHeight;	
	}
		
	gameOptions.seed = seed;
	
	gameOptions.generationInterval = generationIntervalElement.value;
	gameOptions.ballSpeed = ballSpeedElement.value;
	gameOptions.prizes = prizesElement.value;
	gameOptions.countdown = countdownElement.value;
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	setCanvasContextDefaultValues();
		
	var stateObject = {}; 
	var title = "Game";
	var newUrl = "?gameId="+seed+"-"+canvas.width+"-"+canvas.height;
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