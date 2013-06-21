var Grid = function(ctx, fgCtx, options) {
	var opts = options || {};
	var width = opts.width || 32;
	var height = opts.height || 32;
	var ghost = {x : -1, y : -1, w : 2, h : 2};
	var occupiedSquares = [];
	var clearGhostRect = null;
	var astarWorker = new Worker('astarWorker.js');

	this.setGhost = function(dims) {
		if(dims.x >= width - 3) { dims.x = width - 3; }
		if(dims.y >= height - 3) { dims.y = height - 3; }
		ghost.x = dims.x;
		ghost.y = dims.y;
		ghost.w = dims.w || ghost.w;
		ghost.h = dims.h || ghost.h;
	};

	this.getRealPos = function(dims) {
		return { 
			x: ((ctx.canvas.width / width) * dims.x) * settings.scaleFactor,
			y: ((ctx.canvas.height / height) * dims.y) * settings.scaleFactor,
		}
	};

	this.getGhost = function() { return ghost; };

	this.clearGhost = function() {
		if(clearGhostRect) {
			fgCtx.clearRect(clearGhostRect.x, clearGhostRect.y, clearGhostRect.w, clearGhostRect.h);
		}
	};

	this.drawGhost = function() { 
		if(ghost.x > -1 && ghost.y > -1) {
			fgCtx.fillStyle = "rgba(128,128,128,0.3)";	
			fgCtx.fillRect(ghost.x * 10 / settings.scaleFactor, 
				ghost.y * 10 / settings.scaleFactor, 
				ghost.w * 10 / settings.scaleFactor,
				ghost.h * 10 / settings.scaleFactor);

			clearGhostRect = { 
				x: Math.ceil(ghost.x * 10 / settings.scaleFactor) - 1, 
				y: Math.ceil(ghost.y * 10 / settings.scaleFactor) - 1, 
				w: Math.ceil(ghost.w * 10 / settings.scaleFactor) + 2,
				h: Math.ceil(ghost.h * 10 / settings.scaleFactor) + 2
			};
		}
	};

	this.drawOccupied = function() {
		ctx.strokeStyle = "#f00";
		ctx.beginPath();

		for(var x = 0; x < width; x++) {
			for(var y = 0; y < height; y++) {
				if(occupiedSquares[x + "-" + y] == true) {
					ctx.rect(
						x * 10 / settings.scaleFactor, 
						y * 10 / settings.scaleFactor, 
						10 / settings.scaleFactor,
						10 / settings.scaleFactor);
				}
			}
		}
		ctx.stroke();
	};

	this.draw = function() {
		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 0.2;
		for(var x = 10; x <= 320; x += 10) {
			ctx.moveTo(0, x / settings.scaleFactor);
			ctx.lineTo(320 / settings.scaleFactor, x / settings.scaleFactor);
			ctx.moveTo(x / settings.scaleFactor, 0);
			ctx.lineTo(x / settings.scaleFactor, 320 / settings.scaleFactor);
		}
		ctx.stroke();	
		ctx.lineWidth = 1;
	};

	this.occupy = function(spaces) {
		for(var x = spaces.x; x < spaces.x + spaces.w; x++) {
			for(var y = spaces.y; y < spaces.y + spaces.h; y++) {
				occupiedSquares[x + "-" + y] = true;
			}
		}
	};

	this.deOccupy = function(spaces) {
		for(var x = spaces.x; x < spaces.x + spaces.w; x++) {
			for(var y = spaces.y; y < spaces.y + spaces.h; y++) {
				occupiedSquares[x + "-" + y] = false;
				ctx.clearRect(
					Math.floor(x * 10 / settings.scaleFactor) - 1, 
					Math.floor(y * 10 / settings.scaleFactor) - 1, 
					Math.ceil(10 / settings.scaleFactor) + 2,
					Math.ceil(10 / settings.scaleFactor) + 2);	
			}
		}
	};

	this.available = function(spaces) {
		for(var x = spaces.x; x < spaces.x + spaces.w; x++) {
			for(var y = spaces.y; y < spaces.y + spaces.h; y++) {
				if(occupiedSquares[x + "-" + y] == true) { return false; }
			}
		}
		return true;
	};

	var pathSubjects = [];
	astarWorker.addEventListener('message', function(msg) {
		//console.log("A*: " + msg.data.timed + "ms");
		pathSubjects[msg.data.subjectKey].handlePath(msg.data.path, msg.data.requestTimeIndex);
	}, false);

	this.testPath = function(from, to, subject) {
		return aStar({data: {
			from: from, 
			to: to, 
			occupiedSquares: occupiedSquares,
			width: width,
			height: height
		}}).length > 0;
	};

	this.getPath = function(from, to, subject) {
		var pathTimeIndex = new Date().getTime();
		pathSubjects[subject.getHashKey()] = subject;
		subject.setPathTimeIndex(pathTimeIndex);

		astarWorker.postMessage({
			from: from, 
			to: to, 
			occupiedSquares: occupiedSquares,
			width: width,
			height: height,
			subjectKey: subject.getHashKey(),
			requestTimeIndex: pathTimeIndex
		});
	};
};
