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

var GameObject = function(sprite, ctx, options) {
	var opts = options || {};
	var speed = opts.speed || 1;
	var ang = opts.angle || 0;
	var x = opts.x || 0;
	var y = opts.y || 0;
	var z = opts.zIndex || 0;
	var path = [];
	var clearRect = null;
	var bgBuf = document.createElement("canvas");
	var updated = true;
	var hashKey = makeid();
	var _index = -1;
	var newPath = [];
	var pathTimeIndex = 0;
	var pathPending = false;

	function makeid() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for(var i = 0; i < 5; i++) {
    		text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text + "-" + new Date().getTime();
	}
	
	
	this.setIndex = function(idx) { _index = idx; }
	this.getIndex = function() { return _index; }
	this.isUpdated = function() { return updated; }
	this.setUpdated = function(up) { updated = up; }
	this.getHashKey = function() { return hashKey; }

	this.setPathTimeIndex = function(ts) { pathTimeIndex = ts; }

	this.clear = function() {
		if(clearRect) {
			ctx.clearRect(clearRect.x, clearRect.y, clearRect.w, clearRect.h);
		}
	};

	this.draw = function() {
		clearRect = sprite.draw(ctx, x - (sprite.getW()/2), y - (sprite.getH()/2), ang);
		updated = false;
	};

	this.getX = function() { return x; };
	this.getY = function() { return y; };
	this.getZ = function() { return z; };
	
	this.setX = function(setX) { x = setX; };
	this.setY = function(setY) { y = setY; };

	this.isPathPending = function() { return pathPending; };

	this.getPathTo = function(grid, target)  {
		pathPending = true;
		grid.getPath({x : Math.floor(x / 10), y : Math.floor(y / 10) }, target, this);
	};

	this.handlePath = function(p, requestTimeIndex) {
		/** if this handler was called by an outdated worker, ignore it **/
		if(requestTimeIndex < pathTimeIndex) { return; }
		pathPending = false;
		newPath = p;
	};

	this.getNewPath = function() { return newPath; };

	this.setPath = function(setPath) {
		path = (setPath || []);
	};

	/** Action queue targets; returning true means target is achieved and action can be removed from the queue **/
	this.followPath = function() {
		if(path.length == 0) { return true; }
		var t = path[0];
		if(t  == undefined) { return; }
		if(this.moveTo(t.x * 10 + 5, t.y * 10 + 5)) {
			path.shift();
		}
		return false;
	};

	this.moveTo = function(targetX, targetY) {
		updated = true;
		var deltaX = targetX - x;
		var deltaY = targetY - y;
		var mag = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
		ang = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
		if(!ang && ang !== 0) { console.log(ang, x,y,targetX, targetY, deltaX, deltaY); }
		var nextX = x + ((deltaX / mag) * speed);
		var nextY = y + ((deltaY / mag) * speed);
		if(nextX - targetX > -1 && nextX - targetX < 1 && nextY - targetY > -1 && nextY - targetY < 1) {
			x = targetX; 
			y = targetY;
			return true;
		}
		if(!isNaN(nextX) && !isNaN(nextY)) {
			x = nextX; y = nextY;
		}
		
		return false;
	};

	this.moveToOther = function(otherObject) {
		return this.moveTo(otherObject.getX(), otherObject.getY());
	};

	this.pointTo = function(otherObject) {
		updated = true;
		var deltaX = otherObject.getX() - x;
		var deltaY = otherObject.getY() - y;
		ang = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
		return false;
	};
}
