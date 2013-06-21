var Sprite = function(svg, w, h, scaleFactor) {
	var canvas1 = document.createElement('canvas');
	var canvasArray = [];
	this.init = function(initW, initH) {
		var ctx1 = canvas1.getContext('2d');
		w = Math.floor((initW || w) / settings.scaleFactor);
		h = Math.floor((initH || h) / settings.scaleFactor);
		canvas1.width = w;
		canvas1.height = h;

		ctx1.drawSvg(svg, 0, 0, w, h); 
		for(var deg = 0; deg < 361; deg++) {
			canvasArray[deg] = document.createElement('canvas');					
			canvasArray[deg].width = w;
			canvasArray[deg].height = h;
			var ctx = canvasArray[deg].getContext('2d');
			_draw(ctx, deg);
		}
	}

	function _rotate(ctx, ang) {
		ctx.rotate(ang * (Math.PI / 180));
	}

	function _drawImage(ctx) {
		ctx.drawImage(canvas1, -(w/2), -(h/2));
	}

	var _draw = function(ctx, ang) {
		ctx.save();
		ctx.translate((w/2), (h/2));
		_rotate(ctx, ang);
		_drawImage(ctx);
		ctx.restore();
	};

	this.draw = function(ctx, x, y, angF) {
		var ang = parseInt(angF);
		if(ang < 0) { ang = 360 + ang; }
		ctx.drawImage(canvasArray[ang], 
			Math.floor(x / settings.scaleFactor), 
			Math.floor(y / settings.scaleFactor));
		return {
			x : Math.ceil(x / settings.scaleFactor)-1, 
			y : Math.ceil(y / settings.scaleFactor)-1,
			w : Math.ceil(w)+2,
			h : Math.ceil(h)+2,
		};
	}


	this.getW = function() { return w * settings.scaleFactor; }
	this.getH = function() { return h * settings.scaleFactor; }
	this.init();
}
