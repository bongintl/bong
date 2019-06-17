var $ = require('jquery');

var tickers = require('./tickers.js');
var content = require('./content.js');
var letters = require('./letters.js');
var sounds = require('./sound.js');
var video = require('./video.js');

$(function(){
	
	tickers.init( content );
	letters.layout();
	sounds.preload();
	
	var $leftTicker = $('.left-ticker');
	
	function sizeVerticalTickers(){
		$leftTicker.width( window.innerHeight - (28*3) );
	}
	
	sizeVerticalTickers();
	
	$(window).on('resize orientationchange', function(){
		tickers.layout();
		letters.layout();
		sizeVerticalTickers();
	});
	
	var then = Date.now() - 1;
	
	function render(){
		
		var now = Date.now();
		var dT = Math.min(now - then, 40);
		
		tickers.render(dT);
		if(!video.playing) letters.render(dT);
		
		then = now;
		
		requestAnimationFrame(render);
		
	}
	
	render();
	
})
