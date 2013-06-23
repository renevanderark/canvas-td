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
	bullet: new Sprite("bullet.svg", 5,5)
};

window.onload = function() {

	var c = document.getElementById('canvas');
	doResize();
	var ctx = c.getContext('2d');
	var bbgCtx = document.getElementById('bbg').getContext('2d');
	var bgCtx = document.getElementById('bg').getContext('2d');
	var mgCtx = document.getElementById('mg').getContext('2d');
	var txtCtx = document.getElementById("text").getContext('2d');

	var grid = new Grid(bbgCtx, ctx);
	grid.occupy({x: 0, y: -1, w: 14, h: 2});
	grid.occupy({x: 16, y: -1, w: 15, h: 2});
	grid.occupy({x: 0, y: 30, w: 14, h: 2});
	grid.occupy({x: 16, y: 30, w: 15, h: 2});
	
	grid.occupy({y: 0, x: 0, h: 14, w: 1});
	grid.occupy({y: 16, x: 0, h: 15, w: 1});
	grid.occupy({y: 0, x: 30, h: 14, w: 1});
	grid.occupy({y: 16, x: 30, h: 15, w: 1});

	var path = [];

	var creeps = [];
	var towers = [];
	var bullets = [];
	var currentLevel = 1;
	var currentLives = 20;
	var moneyz = 50;


	if($.browser.msie) {
		sounds.bullet = new Sample(new Audio("plop.mp3"), {channels: 5});
		sounds.cheer = new Sample(new Audio("cheer.mp3"), {channels: 3});
		sounds.death = new Sample(new Audio("death.mp3"), {channels: 2});
	} else {
		sounds.bullet = new Sample(new Audio("plop.wav"), {channels: 5});
		sounds.cheer = new Sample(new Audio("cheer.wav"), {channels: 3});
		sounds.death = new Sample(new Audio("death.wav"), {channels: 2});
	}

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
		document.getElementById('text').width = c.width;
		document.getElementById('text').height = c.height;
		settings.scaleFactor = 310 / c.width;
		sprites.creep.init(8,8);
		sprites.pelletTower.init(20,20);
		sprites.bullet.init(4,4);
		for(var i in towers) { towers[i].setUpdated(true); }
		for(var i in bullets) { bullets[i].setUpdated(true); }
		for(var i in creeps) { creeps[i].setUpdated(true); }
		if(grid) { grid.drawOccupied(); }
	}

	var target = {x : 0, y : 0};
	var blockNewPlacement = false;
	document.getElementById("canvas").onclick = function(e) {
		if(blockNewPlacement) {
			shinyMessage("still validating last placement");
		} else {
			var pelletTower = new PelletTower({bulletContext: bgCtx, context: mgCtx, grid: grid, x: grid.getGhost().x, y: grid.getGhost().y});
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
				creeps.splice(i, 1);
				document.getElementById("creepcount").innerHTML = creeps.length;
				document.getElementById("moneyz").innerHTML = moneyz;
				
			} else if(creeps[i].followPath()) {
				currentLives--;
				creeps[i].win();
				creeps.splice(i, 1);
				document.getElementById("creepcount").innerHTML = creeps.length;
				document.getElementById("lives").innerHTML = currentLives;
			}
		}
	}

	function processTick() {
		var overTower = grid.over(towers);
		grid.clearGhost();

		if(overTower > -1) {
			
		} else {
			grid.drawGhost(sprites.pelletTower);
		}

		
		processActionQueue();
		if(creeps.length == 0) {
			currentLevel++;
			initCreeps();
			return;
		}
		if(currentLives <= 0) {
			shinyMessage("Game over");
			return;
		}

		for(var i in towers) { if(towers[i] && towers[i].isUpdated()) { towers[i].clear(); } }
		for(var i in bullets) { if(bullets[i] && bullets[i].isUpdated()) { bullets[i].clear(); } }
		for(var i in creeps) { if(creeps[i] && creeps[i].isUpdated()) { creeps[i].clear(); } }

		for(var i in towers) { if(towers[i] && towers[i].isUpdated()) { towers[i].draw(); } }
		for(var i in bullets) { if(bullets[i] && bullets[i].isUpdated()) { bullets[i].draw(); } }
		for(var i in creeps) { if(creeps[i] && creeps[i].isUpdated()) { creeps[i].draw(); } }


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
				hitpoints: currentLevel * 4,
				value: 3
			});
			creeps.push(creep);
			creep.setTarget({x: 31, y: 15});

			var creep = new Creep(sprites.creep, mgCtx, grid, {
				x: 15,
				y: -1,
				zIndex: 1,
				speed: 0.3 + (currentLevel * 0.02),
				hitpoints: currentLevel * 4,
				value: 3
			});
			creeps.push(creep);
			creep.setTarget({x: 15, y: 31});
		}

		for(var i = 0; i < 10; ++i) {

		}
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
		setTimeout(startTheCreeps, 5000);
	}
	initCreeps();
	function shinyMessage(txt) {
		txtCtx.font = "bold 12px sans-serif";
		txtCtx.fillText(txt, (grid.getGhost().x * 10) / settings.scaleFactor, (grid.getGhost().y* 10) / settings.scaleFactor);
		$("#text").fadeIn();
		setTimeout(removeMessage, 500);
	}

	function removeMessage() {
		$("#text").fadeOut({complete: function() {txtCtx.clearRect(0,0, txtCtx.canvas.width, txtCtx.canvas.height); }});
	}
};


