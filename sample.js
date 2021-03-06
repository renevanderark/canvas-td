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
