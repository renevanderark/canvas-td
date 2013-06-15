function aStar(msg) {
	var from = msg.data.from;
	var to = msg.data.to;
	var occupiedSquares = msg.data.occupiedSquares;
	var width = msg.data.width;
	var height = msg.data.height;
  
	var openList = [from];
  var closedList = [];
	var openLookup = {};
	var closedLookup = {};

  function available(pos) {
      return (
	(occupiedSquares[pos.x + "-" + pos.y] == null || occupiedSquares[pos.x + "-" + pos.y] === false) &&
	(closedLookup[pos.x + "-" + pos.y] == null || closedLookup[pos.x + "-" + pos.y] === false) &&
	(openLookup[pos.x + "-" + pos.y] == null || openLookup[pos.x + "-" + pos.y] === false));
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
		for(var i in openList) {
			if(openList[i].score >= pos.score) {
				openList.splice(i, 0, pos);
				return;
			}
		}
		openList.push(pos);
	}

  function getAdjacent(pos) {
      var left = { x : pos.x - 1, y : pos.y, parent : pos, gScore : 10 };
      var right = { x : pos.x + 1, y : pos.y, parent : pos, gScore : 10 };
      var up = { x : pos.x, y : pos.y - 1, parent : pos, gScore : 10 };
      var down = { x : pos.x, y : pos.y + 1, parent : pos, gScore : 10 };
      var tl = { x : pos.x - 1, y : pos.y - 1, parent : pos, gScore : 14 };
      var tr = { x : pos.x + 1, y : pos.y - 1, parent : pos, gScore : 14 };
      var bl = { x : pos.x - 1, y : pos.y + 1, parent : pos, gScore : 14 };
      var br = { x : pos.x + 1, y : pos.y + 1, parent : pos, gScore : 14 };

      if(left.x > -1 && available(left)) { insert(left); }
      if(right.x < width && available(right)) { insert(right); }
      if(up.y > -1 && available(up)) { insert(up); }
      if(down.y < height && available(down)) {  insert(down); }

      if(tl.x > -1 && tl.y > -1 && available(tl)) { insert(tl); }
      if(tr.x < width && tr.y > -1 && available(tr)) { insert(tr); }
      if(bl.x > -1 && bl.y < height && available(bl)) { insert(bl); }
      if(br.x < width && br.y < height && available(br)) { insert(br); }
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
