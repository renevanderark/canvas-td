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
var Creep = function(sprite, ctx, grid, options) {
	var opts = options || {x: 0, y: 0};
	var dimz = grid.getRealPos({x: opts.x, y: opts.y});
	var _target = {x:-1,y:-1}
	var _hasWon = false;
	var _isDead = false;
	var _mayStart = false;
	var _hitpoints = opts.hitpoints || 5;
	var _value = opts.value || 2;
	opts.x = dimz.x;
	opts.y = dimz.y;

	var parent = new GameObject(sprite, ctx, opts);
	for(var prop in parent) { this[prop] = parent[prop]; }

	var _die = function() {
		sounds.death.play();
		_isDead = true;
		parent.clear();
	};

	this.isDead = function() { return _isDead; };
	this.getValue = function() { return _value; };

	this.takeDamage = function(damage) {
		_hitpoints -= damage;
		if(_hitpoints <= 0) { _die(); }
	};

	this.followPath = function() {
		if(_mayStart) {
			return parent.followPath();
		}
		return false;
	};

	this.start = function() { _mayStart = true; }

	this.setTarget = function(target) { 
		_target = target; 
		this.getPathToTarget();
	};

	this.getPathToTarget = function() {
		this.getPathTo(grid, _target); 
	};

	this.hasWon = function() {
		return _hasWon;
	};

	this.win = function() {
		_hasWon = true;
		sounds.cheer.play();
	};
};
