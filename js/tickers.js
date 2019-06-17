var $ = require('jquery');
var Hamster = require('hamsterjs');
var FontLoader = require('./vendor/fontLoader.js');

// var video = require('./video.js');

var PREFIXED_TRANSFORM = require('detectcss').prefixed('transform');

var CORNER_RADIUS = 20;
var SPEED = 0.1;

var chars = [];
var stringTotalLength = 0;
var position = 0;
var maxPosition = 0;
var wheelDelta = 0;
var dir = 1;
var ticker1, ticker2, ticker3, ticker4;

var EM = 28;

function Ticker( id, $element, fallOver ){
	
	this.$element = $element;
	this.offset = 0;
	
	this.getWidth = function(){
		
		var ww = window.innerWidth;
		var wh = window.innerHeight;
		
		switch( id ) {
			
			case 1:
				this.width = ww + EM * 1.5;
				break;
			case 2:
				this.width = wh - EM * 3;
				break;
			case 3:
				this.width = ww - EM * 3;
				break;
			case 4:
				this.width = wh + EM * 3;
				break;
		}
		
		//this.width = id % 2 === 0 ? this.$element.height() : this.$element.width();
	}
	
	this.render = function(position){
														
		var left = this.width - position + this.offset;
		
		var character, x, r;
		var afterStart, beforeEnd;
		
		for(var i = 0; i < chars.length; i++){
			
			character = chars[i];
			x = left + character.offset;
			
			afterStart = x + character.halfWidth > 0;
			beforeEnd = x + character.halfWidth < this.width;
										
			if(afterStart && beforeEnd){
												
				if(character.inserted !== id) {
					
					$element[0].appendChild( character.$element[0] );
					character.inserted = id;
					
				}
				
				if(fallOver && x + character.halfWidth < CORNER_RADIUS){
					r = (1 - ((x + character.halfWidth) / CORNER_RADIUS)) * -90
				} else {
					r = 0;
				}
				
				character.$element[0].style[PREFIXED_TRANSFORM] = 'translate3d(' + x + 'px, 0, 0) rotate(' + r + 'deg)';
				//character.$element.css('transform', 'translate3d(' + x + 'px, 0, 0) rotate(' + r + 'deg)');
				
			} else if(
				character.inserted &&
				(
					( id === 1 && !beforeEnd ) ||
					( id === 4 && !afterStart )
				)
			){
				character.$element.detach();
				character.inserted = false;
			}
		}					
	}
	
}


function getChars(parts){
	
	chars = [];
	
	function addCharacter(character, bold, href, slug){
		
		var $element = $('<a>').html(character === ' ' ? '&nbsp;' : character);
		
		if(bold) $element.addClass('bold');
		
		if(href) {
			$element
				.attr({href: href, target: '_blank'})
				.hover(pause, pause);
		}
			
		if(slug){
			
			$element.hover(video.play.bind(null, slug), video.stop);
			
		}
		
		chars.push({
			bold: bold,
			content: character,
			$element: $element,
			inserted: false
		});
		
	}
	
	parts.forEach(function(part){
		
		part.string.split('').forEach(function(character){
			
			addCharacter(character, part.bold, part.url, part.slug);
			
		});
		
		addCharacter(' ');
		
	});
	
}

var testCanvasContext = document.createElement('canvas').getContext('2d');

function getCharWidths(string){
	
	function measureCharacter(character){
		
		testCanvasContext.font = /*(character.bold ? "bold " : "" ) + */"28px Work Sans";
		return testCanvasContext.measureText(character.content).width// + (character.bold ? 1 : 0);
		
		/*
		
		var w;
		
		if(!character.inserted) $body.append(character.$element);
		
		w = character.$element.width();
		
		if(!character.inserted) character.$element.detach();
		
		return w;
		
		*/
		
	}
						
	var $body = $('body');
						
	var character;

	stringTotalLength = 0;
	
	for(var i = 0; i < chars.length; i++){
		
		character = chars[i];
		
		character.width = measureCharacter(character);
		character.halfWidth = character.width/2;
		character.offset = stringTotalLength;
														
		stringTotalLength += character.width;
		
	}
	
}

function layout(){
	if(!ready) return;
	getCharWidths();
	ticker1.getWidth();
	ticker2.getWidth();
	ticker3.getWidth();
	ticker4.getWidth();
	ticker2.offset = ticker1.width;
	ticker3.offset = ticker2.offset + ticker2.width;
	ticker4.offset = ticker3.offset + ticker3.width;
	maxPosition = ticker4.offset + ticker4.width + stringTotalLength;
}

var paused = false;

function pause(){
	if(window.innerWidth <= 1024) return;
	paused = !paused;
}

function render(dT){
	
	if(!ready || paused) return;
	
	ticker1.render(position);
	ticker2.render(position);
	ticker3.render(position);
	ticker4.render(position);
						
	position += dT * SPEED * dir;
	position += wheelDelta;
	while(position > maxPosition) position -= maxPosition;
	while(position < 0) position += maxPosition;
	
	wheelDelta = 0;
						
}

Hamster(window).wheel(function(event, delta){
	if(!delta) return;
	wheelDelta -= delta;
	dir = delta > 0 ? -1 : 1;
})

var ready = false;

function init(string){
	
	var loader = new FontLoader(['Work Sans', 'Work Sans:n8'], {
		
		complete: function(e){
			
			getChars(string);
			
			ticker1 = new Ticker( 1, $('.top-ticker'), true );
			ticker2 = new Ticker( 2, $('.left-ticker'), true );
			ticker3 = new Ticker( 3, $('.bottom-ticker'), true );
			ticker4 = new Ticker( 4, $('.right-ticker'), true );
			
			ready = true;
			
			layout();
		
		}
		
	});
	
	loader.loadFonts();
	
}

module.exports = {
	init: init,
	layout: layout,
	render: render
}