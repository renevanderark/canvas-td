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

var PelletTower = function(opts) {
	var level = 1;
	var range = 20;
	var damage = 1;
	var cost = 10;
	var maxBullets = 1;
	var ctx = opts.context;
	var bulletCtx = opts.bulletContext;
	var grid = opts.grid;
	var gridX = opts.x;
	var gridY = opts.y;

	var parent = new GameObject(sprites.pelletTower, ctx, {x: (gridX + 1) * 10, y: (gridY + 1) * 10, zIndex: 0});
	for(var prop in parent) { this[prop] = parent[prop]; }

	var bullet = new GameObject(sprites.bullet, bulletCtx, {x: this.getX(), y: this.getY(), zIndex: 0, speed: 1});
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
			text: "Pellet tower level: " + level + ", range: " + range,
			shape: {type: "circle", radius: realRange, pos: {x: this.getX() / settings.scaleFactor, y:this.getY() / settings.scaleFactor}}
		};
	};

	this.shootAtFirstWithinRange = function(creeps) {
		if(currentTarget) { 
			if(currentTarget.hasWon() || currentTarget.isDead()) { currentTarget = false; }
			else { return _shoot(); }
		}

		for(var i in creeps) {
			if(creeps[i] && _distanceTo(creeps[i]) <= range) {
				currentTarget = creeps[i];
				return _shoot(); 
			}
		}
		currentTarget = false;
		bullet.setX(this.getX());
		bullet.setY(this.getY());
		bullet.setUpdated(true);
		return false;
	};
};
