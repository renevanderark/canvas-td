var PelletTower = function(opts) {
	var level = 1;
	var range = 30;
	var maxBullets = 1;

	var ctx = opts.context;
	var bulletCtx = opts.bulletContext;
	var grid = opts.grid;
	var gridX = opts.x;
	var gridY = opts.y;
	var gameObject = new GameObject(sprites.pelletTower, ctx, {x: (gridX + 1) * 10, y: (gridY + 1) * 10, zIndex: 0});
	var bullet = new GameObject(sprites.bullet, bulletCtx, {x: gameObject.getX(), y: gameObject.getY(), zIndex: 0, speed: 1});

	this.getGameObject = function() { return gameObject; }
	this.getBullet = function() { return bullet; }

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
			opts.creeps[x].getPathTo(grid, {x: 31, y: 15});
		}

		_pollPaths(opts.creeps, opts.onFailure, opts.onSuccess);
	};

	

	var _shootAt = function(otherGameObject) {
		gameObject.pointTo(otherGameObject); 
		if(bullet.moveToOther(otherGameObject)) {
			bullet.setX(gameObject.getX());
			bullet.setY(gameObject.getY());
			sounds.bullet.play();
		}
		return false;	
	};

	this.shootAtFirstWithinRange = function(others) {
		for(var i in others) {
			var deltaX = others[i].getX() - gameObject.getX();
			var deltaY = others[i].getY() - gameObject.getY();
			var distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
			if(distance <= range) { return _shootAt(others[i]); }
		}
		bullet.setX(gameObject.getX());
		bullet.setY(gameObject.getY());
		bullet.setUpdated(true);
		return false;
	};
};
