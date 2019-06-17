require('./vendor/soundjs.js');

var Sound = createjs.Sound;

var letters = ['b', 'o', 'n', 'g', 't', 'm'];

function preload(){
	
	letters.forEach(function(letter){
		Sound.registerSound('sounds/' + letter + '.mp3', letter);
	})
	
};

function play(letter, volume, now){
	
	if( letters.indexOf(letter) === -1 ) return;
	
	var instance = Sound.play(letter);
	instance.volume = volume;
	
};

module.exports = {
	play: play,
	preload: preload
}