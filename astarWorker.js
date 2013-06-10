self.addEventListener('message', function(msg) {	
  var from = msg.data.from;
  var to = msg.data.to;
  var occupiedSquares = msg.data.occupiedSquares;
  var width = msg.data.width;
  var height = msg.data.height;
  function inList(pos, list) {
      for(var i in list) {
          if(list[i].x == pos.x && list[i].y == pos.y) {
              return true;
          }
      }
      return false;
  }
  
  function available(pos, list) {
      return !inList(pos, openList) && !inList(pos, closedList) && !inList(pos, occupiedSquares);
  }

  function getAdjacent(pos, list) {
      var left = { x : pos.x - 1, y : pos.y, parent : pos, gScore : 10 };
      var right = { x : pos.x + 1, y : pos.y, parent : pos, gScore : 10 };
      var up = { x : pos.x, y : pos.y - 1, parent : pos, gScore : 10 };
      var down = { x : pos.x, y : pos.y + 1, parent : pos, gScore : 10 };

      if(left.x > -1 && available(left, list)) { list.push(left); }
      if(right.x < width && available(right, list)) { list.push(right); }
      if(up.y > -1 && available(up, list)) { list.push(up); }
      if(down.y < height && available(down, list)) { list.push(down); }

      var tl = { x : pos.x - 1, y : pos.y - 1, parent : pos, gScore : 14 };
      var tr = { x : pos.x + 1, y : pos.y - 1, parent : pos, gScore : 14 };
      var bl = { x : pos.x - 1, y : pos.y + 1, parent : pos, gScore : 14 };
      var br = { x : pos.x + 1, y : pos.y + 1, parent : pos, gScore : 14 };

      if(tl.x > -1 && tl.y > -1 && available(tl, list)) { list.push(tl); }
      if(tr.x < width && tr.y > -1 && available(tr, list)) { list.push(tr); }
      if(bl.x > -1 && bl.y < height && available(bl, list)) { list.push(bl); }
      if(br.x < width && br.y < height && available(br, list)) { list.push(br); }
  }

  function getScores(list) {
      for(i in list) {
          var deltaX = to.x - list[i].x;
          var deltaY = to.y - list[i].y;
          if(deltaX < 0) { deltaX = -deltaX; }
          if(deltaY < 0) { deltaY = -deltaY; }
          list[i].score = list[i].gScore + (deltaX * 10) + (deltaY * 10);
      }
  }
  var startTime = new Date().getTime();

  if(inList(to, occupiedSquares)) { return []; }
  var openList = [from];
  var closedList = [];
  var current = {x: -1, y: -1};
  while(openList.length > 0 && !(current.x == to.x && current.y == to.y)) {               
      current = openList.shift();
      closedList.push(current);
      getAdjacent(current, openList);
      getScores(openList);
      openList.sort(function(a,b) { return a.score - b.score});
  }
//              console.log("A* timed at: " + (new Date().getTime() - startTime) + "ms");
  if(openList.length == 0) { return []; }
  var finalList = [];
  current = closedList.pop();
  while(current.parent) {
      finalList.push(current);
      current = current.parent;
  }

  self.postMessage({
    path: finalList.reverse(),
    subjectKey: msg.data.subjectKey,
    timed: new Date().getTime() - startTime
  });
}, false);
