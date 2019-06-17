var intro = {
	string: 'Full Service International Design & Development Agency',
	bold: true
}

var email = {
	string: 'WORK@BONG.INTERNATIONAL',
	url: 'mailto:work@bong.international'
}

var twitter = {
	string: '@BONG_INTL',
	url: 'http://twitter.com/bong_intl'
}

var links = [{
		string: 'johnsonbanks.co.uk',
		url: 'http://johnsonbanks.co.uk',
		slug: 'jb'
	},{
		string: 'collectingeurope.net',
		url: 'http://collectingeurope.net',
		slug: 'ce'
	},{
		string: 'bloomberg.com/features/2016-trump-tower',
		url: 'https://www.bloomberg.com/features/2016-trump-tower/',
		slug: 'tt'
	},{
		string: 'computergenerated.net',
		url: 'http://computergenerated.net',
		slug: 'cg'
	},{
		string: 'bloomberg.com/features/2016-good-business',
		url: 'https://www.bloomberg.com/features/2016-good-business/',
		slug: 'gb'
	},
	{
		string: 'hand.gallery',
		url: 'http://hand.bong.international',
		slug: 'hand'
	},
	{
		string: 'activiabenz.com',
		url: 'http://activiabenz.com/',
		slug: 'ab'
	},
	{
		string: 'faceforward.typography.ie',
		url: 'http://faceforward.typography.ie/',
		slug: 'ff'
	},
	{
		string: '2astudio.co.uk',
		url: 'http://2astudio.co.uk/',
		slug: '2a'
	},
		{
		string: 'leannebentley.co.uk',
		url: 'http://www.leannebentley.co.uk/',
		slug: 'leanne'
	},
	{
		string: 'isabelandhelen.com',
		url: 'http://isabelandhelen.com',
		slug: 'ih'
	},
	{
		string: 'kingzog.com',
		url: 'http://kz.benwest.webfactional.com',
		slug: 'kz'
	},
	{
		string: 'typography.ie/call-for-papers',
		url: 'http://typography.ie/call-for-papers/',
		slug: 'call'
	},
	{
		string: 'Parallel Practice',
		url: 'https://www.grafik.net/category/screenshot/parallel-practice',
		//slug: 'parallel'
	},
	{
		string: 'Hover States Interview',
		url: 'https://hoverstat.es/articles/interview-with-bong-international',
		//slug: 'hover'
	},
]

var parts = [intro];

links.forEach(function(link, i){
	link.bold = true;
	parts.push( i % 2 ? email: twitter );
	parts.push(link);
})

module.exports = parts;