/**
    The canvas tower defense game! :)
    Copyright (C) 2013  René van der Ark

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	  window.mozRequestAnimationFrame ||
	  function(callback){
	    window.setTimeout(callback, 1000 / 60);
	  };
})();

var settings = { scaleFactor: 1.0 };
var sounds = {};
var sprites = {
	creep: new Sprite("creep.svg", 8, 8),
	pelletTower:  new Sprite("pellet.svg", 20, 20),
	bullet: new Sprite("bullet.svg", 5, 5),
	rocketTower: new Sprite("rocketlauncher.svg", 20, 20),
	rocket: new Sprite("rocket.svg", 20, 20)
};

var towerTypes = {
	pelletTower: PelletTower,
	rocketTower: RocketTower
};

$(document).ready(function() {
	var c = document.getElementById('canvas');
	var activeShape = false;
	doResize();
	var ctx = c.getContext('2d');
	var bbgCtx = document.getElementById('bbg').getContext('2d');
	var bgCtx = document.getElementById('bg').getContext('2d');
	var mgCtx = document.getElementById('mg').getContext('2d');
	var txtCtx = document.getElementById("text").getContext('2d');

	var grid = new Grid(bbgCtx, ctx);
	grid.occupy({x: 0, y: -1, w: 14, h: 2});
	grid.occupy({x: 16, y: -1, w: 15, h: 2});
	grid.occupy({x: 0, y: 30, w: 14, h: 3});
	grid.occupy({x: 16, y: 30, w: 15, h: 3});
	
	grid.occupy({y: 0, x: -1, h: 14, w: 2});
	grid.occupy({y: 16, x: -1, h: 15, w: 2});
	grid.occupy({y: 0, x: 30, h: 14, w: 3});
	grid.occupy({y: 16, x: 30, h: 15, w: 3});

	var path = [];

	var creeps = [];
	var towers = [];
	var bullets = [];
	var currentLevel = 1;
	var currentLives = 20;
	var moneyz = 50;
	var selectedTowerSprite = sprites.pelletTower;
	var selectedTower = towerTypes.pelletTower;

/*	if($.browser.msie) {
		sounds.bullet = new Sample(new Audio("plop.mp3"), {channels: 5});
		sounds.cheer = new Sample(new Audio("cheer.mp3"), {channels: 3});
		sounds.death = new Sample(new Audio("death.mp3"), {channels: 2});
	} else {*/
		sounds.bullet = new Sample(new Audio("plop.wav"), {channels: 5});
		sounds.cheer = new Sample(new Audio("cheer.wav"), {channels: 3});
		sounds.death = new Sample(new Audio("death.wav"), {channels: 2});
//	}

	function doResize() {
		var c = document.getElementById('canvas');
		var ww = (window.innerWidth || document.body.clientWidth) - 50;
		var wh = (window.innerHeight || document.body.clientHeight) - 50;
		c.width =  (ww > wh ? wh : ww);
		c.height = c.width;
		document.getElementById('bbg').width = c.width;
		document.getElementById('bbg').height = c.height;
		document.getElementById('bg').width = c.width;
		document.getElementById('bg').height = c.height;
		document.getElementById('mg').width = c.width;
		document.getElementById('mg').height = c.height;
		document.getElementById('text').width = c.width +100;
		document.getElementById('text').height = c.height;
		settings.scaleFactor = 310 / c.width;
		sprites.creep.init(8,8);
		sprites.pelletTower.init(20,20);
		sprites.bullet.init(5,5);
		sprites.rocketTower.init(20, 20);
		sprites.rocket.init(20, 20);
		for(var i in towers) { towers[i].setUpdated(true); }
		for(var i in bullets) { bullets[i].setUpdated(true); }
		for(var i in creeps) { creeps[i].setUpdated(true); }
		if(grid) { grid.drawOccupied(); }
	}

	var target = {x : 0, y : 0};
	var blockNewPlacement = false;


	document.getElementById("canvas").onclick = function(e) {
		function placeTower() {
			if(blockNewPlacement) {
				shinyMessage("still validating last placement");
			} else {
				var pelletTower = new selectedTower({bulletContext: bgCtx, context: mgCtx, grid: grid, x: grid.getGhost().x, y: grid.getGhost().y});
				if(moneyz < pelletTower.getCost()) { 
					shinyMessage("not enough $");
					return; 
				}
				blockNewPlacement = true;
				pelletTower.place({
					creeps: creeps,
					onSuccess: function() { 
						moneyz -= pelletTower.getCost();
						towers.push(pelletTower);
						bullets.push(pelletTower.getBullet());
						for(var i in creeps) {
							creeps[i].setPath(creeps[i].getNewPath());
						}
						blockNewPlacement = false;
						document.getElementById("moneyz").innerHTML = moneyz;
					},
					onFailure: function(reason) {
						shinyMessage(reason);
						blockNewPlacement = false;
					}
				});
			}
		}

		function showInfo(gameObject) {
			var stats = gameObject.getStats();
			shinyMessage(stats.text);
			if(activeShape && activeShape.type == 'circle') {
				ctx.clearRect(activeShape.pos.x - activeShape.radius, activeShape.pos.y - activeShape.radius, activeShape.radius * 2, activeShape.radius * 2);
			}
			if(stats.shape) {
				activeShape = stats.shape; 
			} else { 
				activeShape = false; 
			}
		}

		var overTower = grid.over(towers);
		if(overTower > -1) { showInfo(towers[overTower]); }
		else { placeTower(); }
	};

	document.getElementById("canvas").onmouseout = function(e) {
		grid.setGhost({ x : -1, y : -1 });
	};

	document.getElementById("canvas").onmousemove = function(e) {
		grid.setGhost({
			x : Math.floor(((e.pageX - this.offsetLeft- 5) * settings.scaleFactor) / 10),
			y : Math.floor(((e.pageY - this.offsetTop - 5) * settings.scaleFactor) / 10)
		});
	};

	function processActionQueue() {
		for(var i in towers) {
			towers[i].shootAtFirstWithinRange(creeps); 
		}
		for(var i in creeps) {
			if(creeps[i].isDead()) {
				moneyz += creeps[i].getValue();
				shinyMessage("$+" + creeps[i].getValue(), {
					timeout: 250,
					fill: "#afa",
					font: "bold 10px sans-serif",
					shade: "#000",
					shadeDistance: 1,
					x: creeps[i].getX() / settings.scaleFactor,
					y: creeps[i].getY() / settings.scaleFactor
				});
				creeps.splice(i, 1);
				document.getElementById("creepcount").innerHTML = creeps.length;
				document.getElementById("moneyz").innerHTML = moneyz;
			} else if(creeps[i].followPath()) {
				currentLives--;
				creeps[i].win();
				shinyMessage("♥-1", {
					timeout: 250,
					font: "bold 10px sans-serif",
					shade: "#000",
					x: (creeps[i].getX() - 10) / settings.scaleFactor,
					y: (creeps[i].getY() - 10) / settings.scaleFactor
				});
				creeps.splice(i, 1);
				document.getElementById("creepcount").innerHTML = creeps.length;
				document.getElementById("lives").innerHTML = currentLives;
			}
		}
	}

	function clearObjects(gameObjects) {
		var i = gameObjects.length;
		while(i--) {
			if(gameObjects[i] && gameObjects[i].isUpdated()) { gameObjects[i].clear(); }
		}
	}
	
	function drawObjects(gameObjects) {
		var i = gameObjects.length;
		while(i--) {
			if(gameObjects[i] && gameObjects[i].isUpdated()) { gameObjects[i].draw(); }
		}
	}

	function processTick() {
		var overTower = grid.over(towers);
		grid.clearGhost();

		if(overTower > -1) {
			
		} else {
			grid.drawGhost(selectedTowerSprite);
		}

		if(activeShape && activeShape.type == "circle") {
			ctx.beginPath();
			ctx.arc(activeShape.pos.x, activeShape.pos.y, activeShape.radius, 0, 2 * Math.PI, false);
			ctx.fill();
		}

		processActionQueue();
		if(creeps.length == 0) {
			currentLevel++;
			initCreeps();
			return;
		}
		if(currentLives <= 0) {
			shinyMessage("Game over", {
				x: ctx.canvas.width / 2 - 45, 
				y: ctx.canvas.width / 2 - 15,
				font: "bold 35px sans-serif",
				shade: "#000",
				timeout: 10000
			});
			return;
		}

		clearObjects(towers);
		clearObjects(bullets);
		clearObjects(creeps);
		drawObjects(towers);
		drawObjects(bullets);
		drawObjects(creeps);


		requestAnimFrame(processTick);
	}

	function startTheCreeps() {
		for(var i in creeps) {
			if(!creeps[i].wasStarted()) {
				creeps[i].start();
				setTimeout(startTheCreeps, 200);
				return;
			}
		}
	}

	function initCreeps() {
		for(var i = 0; i < 10; ++i) {
			var creep = new Creep(sprites.creep, mgCtx, grid, {
				x: -1,
				y: 15,
				zIndex: 1,
				speed: 0.3 + (currentLevel * 0.02),
				hitpoints: currentLevel * 20,
				value: 1
			});
			creeps.push(creep);
			creep.setTarget({x: 31, y: 15});

			var creep = new Creep(sprites.creep, mgCtx, grid, {
				x: 15,
				y: -1,
				zIndex: 1,
				speed: 0.3 + (currentLevel * 0.02),
				hitpoints: currentLevel * 20,
				value: 1
			});
			creeps.push(creep);
			creep.setTarget({x: 15, y: 31});
		}

		shinyMessage("Level " + currentLevel, {
			x: ctx.canvas.width / 2 - 45, 
			y: ctx.canvas.width / 2 - 15,
			font: "bold 35px sans-serif",
			fill: "#8f8",
			shade: "#000",
			timeout: 1500
		});
		document.getElementById("level").innerHTML = currentLevel;
		document.getElementById("creepcount").innerHTML = creeps.length;
		document.getElementById("lives").innerHTML = currentLives;
		pollForPaths();
	}

	function pollForPaths() {
		for(var i in creeps) {
			if(creeps[i].isPathPending()) {
				setTimeout(pollForPaths, 1);
				return;
			}
		}
		for(var i in creeps) {
			creeps[i].setPath(creeps[i].getNewPath());
		}
		processTick();
		setTimeout(function() { countDown(3); }, 2000);
	}

	function countDown(secs) {
		if(secs == 0) { startTheCreeps() }
		else {
			shinyMessage(secs, {
				x: ctx.canvas.width / 2 - 15, 
				y: ctx.canvas.width / 2 - 15,
				font: "bold 35px sans-serif",
				fill: "#8f8",
				shade: "#000",
				timeout: 1000
			});
			setTimeout(function() { countDown(secs-1); }, 1000);
		}
	}

	initCreeps();
	function shinyMessage(txt, options) {
		var opts = options || {};
		var x = opts.x || (grid.getGhost().x * 10) / settings.scaleFactor;
		var y = opts.y || (grid.getGhost().y * 10) / settings.scaleFactor;

		txtCtx.font = opts.font || "bold 12px sans-serif";
		if(opts.shade) {
			txtCtx.fillStyle = opts.shade;
			txtCtx.fillText(txt, x + (opts.shadeDistance || 2), y + (opts.shadeDistance || 2));
		}
		txtCtx.fillStyle = opts.fill || "#a00";
		txtCtx.fillText(txt, x, y);
		var width = txtCtx.measureText(txt).width;
		setTimeout(function() {
			txtCtx.clearRect(x, y - 27, width + 5, 32);
		}, opts.timeout || 500);
	}
	
	$("a").on("click", function(e) {
		$("a").removeClass("selected");
		$(this).addClass("selected");
		selectedTowerSprite = sprites[$(this).attr("id")];
		selectedTower = towerTypes[$(this).attr("id")];
	});
});


