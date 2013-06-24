/**
	The A* algorithm js function and worker spec with poor indentation
		Copyright (C) 2013	René van der Ark

		This program is free software: you can redistribute it and/or modify
		it under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
		GNU General Public License for more details.

		You should have received a copy of the GNU General Public License
		along with this program.	If not, see <http://www.gnu.org/licenses/>.
*/
function aStar(msg) {
	var from = msg.data.from;
	var to = msg.data.to;
	var occupiedSquares = msg.data.occupiedSquares;
	var width = msg.data.width;
	var height = msg.data.height;

	var openList = [{x: from.x, y: from.y, gScore: 0}];
	var closedList = [];
	var openLookup = {};
	var closedLookup = {};

	function available(pos) {
		var key = pos.x + "-" + pos.y;
		return (!occupiedSquares[key] && !closedLookup[key] && !openLookup[key] && (pos.x > -1 && pos.y > -1 && pos.x < width + 1 && pos.y < height + 1));
	}

	function getScore(pos) {
		var deltaX = to.x - pos.x;
		var deltaY = to.y - pos.y;
		if(deltaX < 0) { deltaX = -deltaX; }
		if(deltaY < 0) { deltaY = -deltaY; }
		pos.score = pos.gScore + (deltaX * 10) + (deltaY * 10);
	}

	function insert(pos) {
		openLookup[pos.x + "-" + pos.y] = true;
		getScore(pos);
		var l = openList.length;
		for(var i = 0; i < l; i++) {
			if(openList[i].score >= pos.score) {
				openList.splice(i, 0, pos);
				return;
			}
		}
		openList.push(pos);
	}

	function getAdjacent(pos) {
		var left = { x : pos.x - 1, y : pos.y, parent : pos, gScore : pos.gScore + 10 };
		var right = { x : pos.x + 1, y : pos.y, parent : pos, gScore : pos.gScore + 10 };
		var up = { x : pos.x, y : pos.y - 1, parent : pos, gScore : pos.gScore + 10 };
		var down = { x : pos.x, y : pos.y + 1, parent : pos, gScore : pos.gScore + 10 };
		var tl = { x : pos.x - 1, y : pos.y - 1, parent : pos, gScore : pos.gScore + 14 };
		var tr = { x : pos.x + 1, y : pos.y - 1, parent : pos, gScore : pos.gScore + 14 };
		var bl = { x : pos.x - 1, y : pos.y + 1, parent : pos, gScore : pos.gScore + 14 };
		var br = { x : pos.x + 1, y : pos.y + 1, parent : pos, gScore : pos.gScore + 14 };

		if(available(tl) && (available(up) || available(left))) { insert(tl); }
		if(available(tr) && (available(up) || available(right))) { insert(tr); }
		if(available(bl) && (available(down) || available(left))) { insert(bl); }
		if(available(br) && (available(down) || available(right))) { insert(br); }


		if(available(left)) { insert(left); }
		if(available(right)) { insert(right); }
		if(available(up)) { insert(up); }
		if(available(down)) { insert(down); }

	}

	if(occupiedSquares[to.x + "-" + to.y]) { return []; }

	var current = {x: -1, y: -1};
	while(openList.length > 0 && !(current.x == to.x && current.y == to.y)) {
		current = openList.shift();
		openLookup[current.x + "-" + current.y] = false;
		closedList.push(current);
		closedLookup[current.x + "-" + current.y] = true;
		getAdjacent(current);
	}

	if(openList.length == 0) { return []; }

	var finalList = [];
	current = closedList.pop();
	while(current.parent) {
		finalList.push(current);
		current = current.parent;
	}
	return finalList.reverse();
}

self.addEventListener('message', function(msg) {	
	var startTime = new Date().getTime();	
	self.postMessage({
		path: aStar(msg),
		timed: (new Date().getTime() - startTime),
		subjectKey: msg.data.subjectKey,
		requestTimeIndex: msg.data.requestTimeIndex
	});
}, false);
