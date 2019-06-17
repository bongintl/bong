var $ = require('jquery');

var $body = $('body');
var $container = $('<div>').addClass('video-container');
var $video = $('<video>');

$container.append($video);

$video.attr({
	autoplay: true,
	loop: true
});

function play(slug){
	if(window.innerWidth <= 1024) return;
	$video.attr({
		src: 'assets/' + slug + '.mp4',
		poster: 'assets/' + slug + '.jpg'
	})
	$container.appendTo($body);
	video.playing = true;
}

function stop(){
	if(window.innerWidth <= 1024) return;
	$video.attr({
		src: '',
		poster: ''
	});
	$container.detach();
	video.playing = false;
}

var video = {
	play: play,
	stop: stop,
	playing: false
}

module.exports = video;