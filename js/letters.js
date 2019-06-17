var Matter = require('matter-js');

var sounds = require('./sound.js');
var BongRenderer = require('./renderer.js');

var Engine = Matter.Engine,
    World = Matter.World,
    Events = Matter.Events,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint;

var engine = Engine.create({
	render: {
		controller: BongRenderer
	}
});

function reduceSum(arr){
	return arr.reduce(function(memo, sum){return memo + sum}, 0)
};

var LETTER_RATIOS = [0.211, 1, 0.277, 0.245, 0.04, 0.05];
var LETTER_SPACINGS = [0.12, 0.074, 0.065, 0.025, 0.01];
var TM_HEIGHT = 0.05;
var WORD_RATIO = reduceSum(LETTER_RATIOS) + reduceSum(LETTER_SPACINGS);

var mouseConstraint, allBodies;

function layout(){
	
	World.clear(engine.world);
	
	var margin = Math.min(window.innerWidth, window.innerHeight) / 5;
	
	var w = window.innerWidth - margin*2;
	var h = window.innerHeight - margin*2;
	
	var screenRatio = w/h;
	
	var x = margin;
	var y = margin;
	var wordHeight;
	
	if(screenRatio > WORD_RATIO){
		
		wordHeight = h;
		x += ( w * (screenRatio - WORD_RATIO) ) / (screenRatio * 2)
		
	} else {
		
		wordHeight = h * (screenRatio / WORD_RATIO)
		y += (h - wordHeight) / 2;
		
	}
	
	var shapes = ['b', 'o', 'n', 'g', 't', 'm'].map(function(letter, i){
		
		var letterWidth = wordHeight * LETTER_RATIOS[i];
		var letterHeight = wordHeight * (i >= 4 ? TM_HEIGHT : 1);
		var shape;
		
		if(letter !== 'o'){
			
			shape = {
				type: 'rectangle',
				x: x + letterWidth/2,
				y: y + letterHeight/2,
				w: letterWidth,
				h: letterHeight,
				label: letter
			}
			
		} else {
			
			var radius = letterHeight / 2;
			
			shape = {
				type: 'circle',
				x: x + radius,
				y: y + radius,
				r: radius,
				label: letter
			}
			
		}
		
		if(i < 5) x += letterWidth + (LETTER_SPACINGS[i] * wordHeight);
		
		return shape;
		
	});
	
	var bodies = shapes.map(function(shape){
		
		if(shape.type === 'rectangle'){
			return Bodies.rectangle(shape.x, shape.y, shape.w, shape.h, {label: shape.label});
		} else {
			return Bodies.circle( shape.x, shape.y, shape.r, {label: shape.label} );
		}
		
	});
	
	var constraints = shapes.map(function(shape, i){
		
		return Constraint.create({
			bodyA: bodies[i],
			pointA: {x: 0, y: shape.r ? -shape.r : -shape.h/2},
			pointB: {x: shape.x, y: 0}
		})
		
	})
	
	World.add( engine.world, bodies );
	
	World.add( engine.world, constraints );
	
	var ceiling = Bodies.rectangle(window.innerWidth / 2, -200, window.innerWidth, 100, {isStatic: true});
	
	World.add( engine.world, ceiling );
	
	mouseConstraint = MouseConstraint.create(engine, {mouse: engine.render.mouse});
	
	World.add( engine.world, mouseConstraint );
	
	engine.render.layout(shapes);
	
	allBodies = Composite.allBodies(engine.world);
	
}

var lastdT = 16;

Events.on(engine, 'collisionStart', function(e){
	
	var pair = e.pairs[0];
	
	if(pair.timeCreated !== pair.timeUpdated) return;
	
	var bodyA = pair.bodyA;
	var bodyB = pair.bodyB;
	
	var depth = pair.collision.depth;
	
	var volume = Math.min(depth * .1, 1);
	
	sounds.play(bodyA.label, volume);
	sounds.play(bodyB.label, volume);
	
})

//Engine.run(engine);

function render(dT){
	
	MouseConstraint.update( mouseConstraint, allBodies );
	Engine.update(engine, dT, dT/lastdT);
	engine.render.controller.world(engine);
	
	lastdT = dT;
	
}

module.exports =  {
	layout: layout,
	render: render
}