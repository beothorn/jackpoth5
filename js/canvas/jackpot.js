var ballWidth = 26;
var ballHeight = 26;
var radius = ballWidth / 2;
var diameter = 2 * radius;
var diameterPowerOfTwo = diameter * diameter;
var elements;
var oneSecond = 1000;
var FPS = 30;
var frameLimit = Math.floor(oneSecond/FPS);
var running = false;
var timePassed = 0;
var lastLoopTime = Date.now();
var delta = 0;
var gameEnded = false;
var gameSpeed = 1;
var maxBallFontSize = 80;

var canvas= document.getElementById("game-canvas");
var context= canvas.getContext("2d");
context.textAlign="center";
context.font = "italic 40pt Calibri";

resources.load(
	[
		{url:"images/canvas/white.png",name:"white",type:"image"},
		{url:"images/canvas/explosion.png",name:"explosion",type:"image"},
		{url:"sounds/go.wav",name:"go",type:"audio"}
	],
	{
		updateLoadedPercentage: function(percetLoaded){
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillText("Loading "+percetLoaded+"%", 10, 10);
			console.log(percetLoaded);
		},
		loadingComplete: function(){
			console.log("Done");
			loadingElement.style.display="none";
		  playElement.style.display="block";
      var loadFromUrl = function(){
          var opts = transformToAssocArray(window.location.hash.substr(1));
          gameOptions.players = opts.players.split(',');
	        
	        configElement.style.display="none";
          canvasParentElement.style.display="flex";
	        
	        gameOptions.seed = opts.seed;
	        
	        gameOptions.generationInterval = 5;
	        gameOptions.ballSpeed = 5;
	        gameOptions.prizes = opts.prizes;
	        gameOptions.countdown = 10;
	        
	        context.clearRect(0, 0, canvas.width, canvas.height);
	        setCanvasContextDefaultValues();
		      
          restart();
      }
      if(window.location.hash.substr(1) !== ""){
          loadFromUrl();
      }
      window.addEventListener("hashchange", loadFromUrl, false);

		} 
	}
);

function fillStrokedText(text, x, y){
	context.strokeText(text, x, y);
	context.fillText(text, x, y);
}

function calcNewFontSize(ballQntd){
	var size = Math.max(-Math.pow(ballQntd,1.5) + maxBallFontSize, 30);
	context.font = "bold "+size+"px Arial";
	context.strokeStyle = "black";
	context.lineWidth = 3;
	context.fillStyle = "white";
	context.textAlign="center";
}

function setCanvasContextDefaultValues(){
	context.font = "bold 20px Arial";
	context.strokeStyle = "black";
	context.lineWidth = 3;
	context.fillStyle = "white";
	context.textAlign="center";	
}

function setCanvasContextPausedScreenValues(){
	context.font = "bold 40px Arial";
	context.strokeStyle = "black";
	context.lineWidth = 3;
	context.fillStyle = "white";
	context.textAlign="center";
}

function freezeScreen(){
	var currentPixels = context.getImageData(0, 0, canvas.width, canvas.height);
	var d = currentPixels.data;
	for (var i=0; i<d.length; i+=4) {
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		// CIE luminance for the RGB
		// The human eye is bad at seeing red and blue, so we de-emphasize them.
		var v = 0.2126*r + 0.7152*g + 0.0722*b;
		d[i] = d[i+1] = d[i+2] = v;
		
		if(d[i+3] === 0){
			d[i] = d[i+1] = d[i+2] = 0;
			d[i+3] -= 0 ;	
		}
	}
	context.putImageData(currentPixels, 0, 0);
	context.fillStyle = "rgba(255, 255, 255, 0.95 )";
	context.fillRect(0, 0, canvas.width, canvas.height);
	setCanvasContextPausedScreenValues();
}

function showWinningScreen(winners){
	console.log("winners");
	console.log(winners);
	gameEnded = true;
	freezeScreen();
	var winnerTitleSize = 40;
	var halfWinnerTitleSize = winnerTitleSize/ 2;
	var offset = 20;
	context.font = "bold "+winnerTitleSize+"px Arial";
	context.fillStyle = "gray";
	var winnerTag = "Winner"; 
	if(winners.length > 1)
		winnerTag = "Winners";
	fillStrokedText(winnerTag, canvas.width/2, offset+halfWinnerTitleSize);
	var winnerNameSize = 80;
	context.font = "bold "+winnerNameSize+"px Arial";
	context.fillStyle = "yellow";
	for(var i=0;i<winners.length;i++){
		fillStrokedText(winners[i], canvas.width/2, offset+winnerTitleSize + (winnerNameSize*(winners.length-i)));
	}
	setCanvasContextPausedScreenValues();
}

var enter = 13;
var escape = 27;
var space = 32;
var leftKey = 37;
var rightKey = 39;

document.onkeydown = function(e) {
    
  if(e.keyCode === leftKey){
    	gameSpeed--;
    	if(gameSpeed<1)
    		gameSpeed = 1
		e.preventDefault();
	}
	if(e.keyCode === rightKey){
		gameSpeed++;
		e.preventDefault();
	}
	if(e.keyCode === escape){
		stop();
		e.preventDefault();
	}
	if(e.keyCode === space){
		if(gameEnded){
			e.preventDefault();
			return;
		}
		if(running){
			running = false;
			
			freezeScreen();
			
			context.font = "bold 80px Arial";
			context.fillStyle = "yellow";
			fillStrokedText("Paused", canvas.width/2, canvas.height/2);
			setCanvasContextPausedScreenValues();
			fillStrokedText("Change speed with arrows", canvas.width/2, canvas.height/2 + 80);
			fillStrokedText("Exit: <Esc>", canvas.width/2, canvas.height/2 + 80 + 40);
			
			setCanvasContextDefaultValues();
		}else{
			running = true;
			loop();
		}
		e.preventDefault();
	}
};

function areColliding(point1, point2){
	if(point1.dying || point2.dying)
		return false;
    var xs = point2.x - point1.x;
    xs *= xs;
    var ys = point2.y - point1.y;
    ys *= ys;
    return  xs + ys  < diameterPowerOfTwo;
}

function normalize(x,y){ 
	var length = Math.sqrt(x * x + y * y);
	if (length === 0) return {x:1,y:0};
	return {x:(x / length), y:(y / length)};
}

function onCollision(a, b){
	if(a.killer && !b.killer){
		b.die();
	}
	if(!a.killer && b.killer){
		a.die();
	}
	
	var normal = normalize(a.x-b.x,a.y-b.y);

 	b.x = a.x - (normal.x * diameter);
 	b.y = a.y - (normal.y * diameter);	
	
	var aF = a.xSpeed * normal.x + a.ySpeed * normal.y;
	var bF = b.xSpeed * normal.x + b.ySpeed * normal.y;
	var fDelta = aF - bF;
	a.xSpeed -=  fDelta * normal.x;
	a.ySpeed -=  fDelta * normal.y;
	b.xSpeed +=  fDelta * normal.x;
	b.ySpeed +=  fDelta * normal.y;
}

function isCollidingWithAny(a){
	for(var i in elements){
		if(areColliding(elements[i],a)){
			return true;
		}
	}
	return false;
}

function printTime(time){
	context.fillText(time,10,10);	
}

function Animation(onAnimationEnd){
	this.frameAnim = 0;
	this.frameCount = 16;
	this.timePassed = 0;
	this.animationStrip = resources.get("explosion");
	this.animationDuration = 500; //millisseconds
	this.onAnimationEnd = onAnimationEnd;
}

Animation.prototype.paint = function(delta, x, y){
	this.timePassed += delta;
	var currentFrame = Math.floor(this.frameCount*(this.timePassed/this.animationDuration));
	var sourceX = ballWidth*currentFrame;
	context.drawImage(this.animationStrip, sourceX, 0, ballWidth, ballHeight, x, y, ballWidth, ballHeight);
	if(this.timePassed > this.animationDuration){
		this.onAnimationEnd();
	}
}

function Ball(x, y, xSpeed, ySpeed, name){
	this.x = x;
	this.y = y;
	this.xSpeed = xSpeed;
	this.ySpeed = ySpeed;
	this.name = name;
	this.canvas = getBall(name);
	var self = this;
	this.explosion = new Animation(function(){self.dead = true;});
}

Ball.prototype.paint = function(delta){
	if(this.dying){
		this.explosion.paint(delta, this.x, this.y);
	}else{
		context.drawImage(this.canvas, this.x, this.y);
	}
	if(this.name && !this.dying){
		fillStrokedText(this.name, this.x+radius, this.y);
	}
}

Ball.prototype.die = function(){
	resources.get("go").play();
	this.dying = true;
}

function randomBall(name){ 
	return new Ball(Math.random()*canvas.width,
					Math.random()*canvas.height,
					(Math.random()*gameOptions.ballSpeed*2)-gameOptions.ballSpeed,
					(Math.random()*gameOptions.ballSpeed*2)-gameOptions.ballSpeed,
					name
				);
}
	
function killerBall(){
	var firstKiller = new Ball(canvas.width/2,
					canvas.height/2,
					(Math.random()*gameOptions.ballSpeed*2)-gameOptions.ballSpeed,
					(Math.random()*gameOptions.ballSpeed*2)-gameOptions.ballSpeed
				);
	firstKiller.killer = true;
	elements.push(firstKiller);
}
	
function getSeed(){
	return gameOptions.seed;
}

function stop(){
	gameStopped();
	running = false;
}

function start(){
	isOnCountdown = true;
	restart();
}

var lastGeneratedBallTime = 0;
var isOnCountdown = true;

function restart(){
	Math.seedrandom(getSeed());
	gameEnded = false;
	var names = gameOptions.players;
	
	timePassed = 0;
	running = true;
	context.clearRect(0, 0, canvas.width, canvas.height);
	elements = new Array();
	clearBalls();
	for(var i = 0; i < names.length; i++){
		var newBall = randomBall(names[i]);
		while(isCollidingWithAny(newBall)){
			newBall = randomBall(names[i]);
		}
		elements.push(newBall);
	}
	killerBall();
	delta = 0;
	lastGeneratedBallTime = 0;
	lastLoopTime = Date.now();
	requestAnimationFrame(loop);
}

function stepCountDown(timePassedInSeconds){
	if(timePassedInSeconds >= gameOptions.countdown){
		isOnCountdown = false;
		setCanvasContextDefaultValues();
		return;
	}
	setCanvasContextDefaultValues();
	calcNewFontSize(elements.length);
	for(var i=elements.length-1;i>=0;i--){
		elements[i].paint(delta);
	}
	context.font = "bold 200px Arial";
	context.fillStyle = "rgba(255, 0, 0, 0.5 )";
	fillStrokedText(gameOptions.countdown-timePassedInSeconds, canvas.width/2, canvas.height/2);
}

function step(){
	for(var i=0;i<elements.length;i++){elements[i].x+=elements[i].xSpeed;
		elements[i].y+=elements[i].ySpeed;
		
		if(elements[i].x + diameter > canvas.width)
			elements[i].xSpeed = -Math.abs(elements[i].xSpeed);
		if(elements[i].x < 0)
			elements[i].xSpeed = Math.abs(elements[i].xSpeed);
		if(elements[i].y + diameter > canvas.height)
			elements[i].ySpeed = -Math.abs(elements[i].ySpeed);
		if(elements[i].y < 0)
			elements[i].ySpeed = Math.abs(elements[i].ySpeed);
	}
	for(var i=0;i<elements.length;i++){
		for(var j=i+1;j<elements.length;j++){
			if(areColliding(elements[i],elements[j])){
				onCollision(elements[i],elements[j]);
				break;
			}
		}
		
	}
	var liveCount = 0;
	
	for(var i=elements.length-1;i>=0;i--){
		if(elements[i].dead){
			elements.splice(elements.indexOf(elements[i]), 1);
		}else{
			if(!elements[i].killer && !elements[i].dying)
				liveCount++;
		}
	}
	calcNewFontSize(liveCount);
	for(var i=elements.length-1;i>=0;i--){
		elements[i].paint(delta);
	}

	if(liveCount == gameOptions.prizes){
		var winners = [];
		running = false;
		for(var i=elements.length-1;i>=0;i--){
			if(!elements[i].dead &&!elements[i].killer && !elements[i].dying)
				winners.push(elements[i].name);
		}
		showWinningScreen(winners);
	}
}

function stepGame(timePassedInSeconds){
	if(timePassedInSeconds-lastGeneratedBallTime >= gameOptions.generationInterval){
		lastGeneratedBallTime = timePassedInSeconds;
		killerBall();
	}
	
	printTime(Math.floor(timePassed/1000));
	step();                             		
}

function loop(){
	if(!running) return;
	var currentTime = Date.now();
	delta += currentTime - lastLoopTime;
	if(delta < frameLimit){
		lastLoopTime = Date.now();
		requestAnimationFrame(loop);
		return;	
	}
	for(var i=0;i<gameSpeed;i++){
		timePassed+=frameLimit;
		var timePassedInSeconds = Math.floor(timePassed/1000);
		context.clearRect(0, 0,canvas.width, canvas.height);
	
		if(isOnCountdown)
			stepCountDown(timePassedInSeconds);
		else
			stepGame(timePassedInSeconds);	
	
		lastLoopTime = Date.now();
		delta = 0;
		if(gameEnded)
			break;
	}
	requestAnimationFrame(loop);			
}
