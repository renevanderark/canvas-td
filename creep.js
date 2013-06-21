var Creep = function(sprite, ctx, grid, options) {
	var opts = options || {x: 0, y: 0};
	var dimz = grid.getRealPos({x: opts.x, y: opts.y});
	var _target = {x:-1,y:-1}
	var _hasWon = false;
	var _isDead = false;
	var _hitpoints = opts.hitpoints || 5;
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

	this.takeDamage = function(damage) {
		_hitpoints -= damage;
		if(_hitpoints <= 0) { _die(); }
	};

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
