var Sample = function(audio, options) {
	var opts = options || {};
	var _nChannels = opts.channels || 1;
	var _channels = [];
	var _firstTimers = [];
	for(var i = 0; i < _nChannels; i++) {
		_channels[i] = audio.cloneNode();
		_firstTimers[i] = _channels[i];
	}

	this.play = function() {
		if(_firstTimers.length > 0) { 
			_firstTimers.pop().play(); 
			return; 
		}
		for(var i = 0; i < _nChannels; i++) {
			if(_channels[i].ended) {
				_channels[i].play();
				return;
			}
		}
	};
};
