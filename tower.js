/**
	A class in the canvas tower defense game!
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
*/

var Tower = function(opts) {
	var level = 1;
	var name = opts.name || "Tower";
	var range = opts.range || 20;
	var damage = opts.damage || 1;
	var cost = opts.cost || 10;
	var ctx = opts.context;
	var bulletCtx = opts.bulletContext;
	var grid = opts.grid;
	var gridX = opts.x;
	var gridY = opts.y;

	var parent = new GameObject(opts.sprite, ctx, {x: (gridX + 1) * 10, y: (gridY + 1) * 10, zIndex: 0});
	for(var prop in parent) { this[prop] = parent[prop]; }

	var bullet = new GameObject(opts.bulletSprite, bulletCtx, {x: this.getX(), y: this.getY(), zIndex: 0, speed: opts.bulletSpeed || 1});
	var currentTarget = false;

	this.getBullet = function() { return bullet; }
	this.getCost = function() { return cost; }

	var _pollPaths = function(creeps, onFailure, onSuccess) {

		for(var i in creeps) {
			if(creeps[i].isPathPending()) {
				setTimeout(function() { _pollPaths(creeps, onFailure, onSuccess) }, 1);
				return;
			}
			if(creeps[i].getNewPath().length == 0) {
				_deOccupyGrid();
				onFailure("Creep path is blocked");
				return;
			}
		}
		onSuccess();
	};

	var _deOccupyGrid = function() {
		grid.deOccupy({x: gridX, y: gridY, w: 2, h: 2});
	};

	this.place = function(opts) {				
		if(!grid.available({x: gridX, y: gridY, w: 2, h: 2})) { 
			opts.onFailure("Grid space is occupied"); 
			return;
		}

		grid.occupy({x: gridX, y: gridY, w: 2, h: 2});
		if(!grid.testPath({x: 0, y: 15}, {x: 31, y: 15}) ||
			!grid.testPath({x: 15, y: 0}, {x: 15, y: 31})) {
			_deOccupyGrid();
			opts.onFailure("Paths are blocked");
			return;
		}

		for(var x in opts.creeps) {
			opts.creeps[x].getPathToTarget();
		}

		_pollPaths(opts.creeps, opts.onFailure, opts.onSuccess);
	};

	var _distanceTo = function(thing) {
		var deltaX = thing.getX() - parent.getX();
		var deltaY = thing.getY() - parent.getY();
		return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
	};

	var _shoot = function() {
		parent.pointTo(currentTarget);
		if(bullet.moveToOther(currentTarget)) {
			currentTarget.takeDamage(damage);
			bullet.setX(parent.getX());
			bullet.setY(parent.getY());
			sounds.bullet.play();

			if(_distanceTo(currentTarget) > range) {
				currentTarget = false;
			}
		}
		return false;
	};

	this.getStats = function() {
		var realRange = range / settings.scaleFactor;
		return {
			text: name + " level: " + level + ", range: " + range + ", damage: " + damage,
			shape: {type: "circle", radius: realRange, pos: {x: this.getX() / settings.scaleFactor, y:this.getY() / settings.scaleFactor}}
		};
	};

	function _resetBullet() {
		bullet.setX(parent.getX());
		bullet.setY(parent.getY());
		bullet.setAngle(parent.getAngle());
		bullet.setUpdated(true);
	}
	
	this.shootAtFirstWithinRange = function(creeps) {
		if(currentTarget) { 
			if(currentTarget.hasWon() || currentTarget.isDead()) { 
				currentTarget = false; 
				_resetBullet();
			}
			else { return _shoot(); }
		}

		for(var i in creeps) {
			if(creeps[i] && _distanceTo(creeps[i]) <= range) {
				currentTarget = creeps[i];
				return _shoot(); 
			}
		}
		return false;
	};
};

var PelletTower = function(opts) {
	opts = $.extend(opts || {}, {
		name: "Pellet tower",
		sprite: sprites.pelletTower,
		bulletSprite: sprites.bullet
	});

	var parent = new Tower(opts);
	for(var prop in parent) { this[prop] = parent[prop]; }
};

var RocketTower = function(opts) {
	opts = $.extend(opts || {}, {
		name: "Rocket launcher",
		sprite: sprites.rocketTower,
		bulletSprite: sprites.rocket,
		cost: 20,
		damage: 5,
		range: 60,
		bulletSpeed: 0.7
	});

	var parent = new Tower(opts);
	for(var prop in parent) { this[prop] = parent[prop]; }
};