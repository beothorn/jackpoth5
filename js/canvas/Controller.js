var runnersElement = document.getElementById("runners");
var seedElement = document.getElementById("seed");
var configElement = document.getElementById("config");
var seededWidthElement = document.getElementById("seededWidth");
var seededHeightElement = document.getElementById("seededHeight");
var isSeededElement = document.getElementById("isSeeded");
var generationIntervalElement = document.getElementById("generationInterval");
var ballSpeedElement = document.getElementById("ballsSpeed");
var prizesElement = document.getElementById("prizes");
var loadingElement = document.getElementById("loading");
var playElement = document.getElementById("playButton");
var countdownElement = document.getElementById("countdown");

playElement.style.display="none";

var gameOptions = {};

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
	if(isSeededElement.checked){
	    seed = seedElement.value;
	       
	    context.canvas.width  = seededWidthElement.value;
		context.canvas.height = seededHeightElement.value;
	}else{
	    context.canvas.width  = window.innerWidth;
		context.canvas.height = window.innerHeight;	
	}
		
	gameOptions.seed = seed;
	
	gameOptions.hasSeed = isSeededElement.checked;
	
	gameOptions.generationInterval = generationIntervalElement.value;
	gameOptions.ballSpeed = ballSpeedElement.value;
	gameOptions.prizes = prizesElement.value;
	gameOptions.countdown = countdownElement.value;
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	setCanvasContextDefaultValues();
	
	console.log(gameOptions);
	
    start();
}

isSeededElement.onclick = function(){
    if(document.getElementById("isSeeded").checked){
        document.getElementById("seedOptions").style.display="block";
    }else{
        document.getElementById("seedOptions").style.display="none";
    }
}

function gameStopped(){
    configElement.style.display="block";
	canvas.style.display="none";
}