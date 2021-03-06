/**
 * use require in node.js
 */
if (typeof require === "function") {
	var assert = require("assert");
	var jsel = require("../jsel");
}

// define some arbitrary data
var data = {
	type: 'root',
	value: 'val1',
	attributes: {id: 1},
	children: [
		{
			type: 'element1',
			value: 'val1',
			attributes: {id: 2, egg: 'flip'},
			children: [
				{
					type: 'foo1',
					value: 'val3',
					attributes: {id: 3}
				},
				{
					type: 'foo2',
					value: 'val4',
					attributes: {id: 4}
				}
			]
		},
		{
			type: 'element2',
			value: 'val5',
			attributes: {id: 5, egg: 'roll'},
			children: []
		}
	]
};

// define a custom adapter for this data, these are the full handlers needed - nodeName, childNodes, attributes, and nodeValue
var customAdapters = {
	nodeName: function (node) {
		// return a string representing the element name equivalent of the given node
		return node.type;
	},
	childNodes: function (node) {
		// return an array or null/undefined value representing the children of the given node
		return node.children;
	},
	attributes: function (node) {
		// return an object map or null/undefined value representing the attributes of the given node
		return node.attributes;
	},
	nodeValue: function (node) {
		// return the text() whole value equivalent of the given node
		return node.value;
	}
};

// define custom mappings of element names used in expressions, to their expanded form in the data
var customMappings = {
	'e': 'element'
};

describe('Standard Adapter:', function () {
	var dom = jsel(data);
	it('should return 22 for select "count(//*)"', function () {
		assert.equal(13, dom.select('count(//*)'));
	});
	it('should return "val1" for select "//*[@type="element1"]/@value"', function () {
		assert.equal('val1', dom.select('//*[@type="element1"]/@value'));
	});
	it('should return ["element1", "element2"] for selectAll "//children[1]/*/@type"', function () {
		var result = dom.selectAll("//children[1]/*/@type");
		assert.equal(true, result instanceof Array);
		assert.equal(2, result.length);
		assert.equal('element1', result[0]);
		assert.equal('element2', result[1]);
	});
});

describe('General Selectors:', function () {
	var dom = jsel({			// child 1 "object" 				= *
		title: "abc", 			// attribute "title" value "abc"	= @title
		children: [				// child 2 "children"				= */children
			{					// child 3 "object"					= */children[1]
				foo: "bar"		// attribute "foo" value "bar"		= */children[1]/@foo
			},
			'val'				// child 4 "string" value "val"		= */children[2]
		],
		subData: {				// child 5 "subData"				= */subData
			foo: 555,			// attribute "foo" value 555		= */subData/@foo
			foo2: "bar2"		// attribute "foo2" value "bar2"	= */subData/@foo2
		}
	});
	it('should return 5 for select "count(//*)"', function () {
		assert.equal(5, dom.select('count(//*)'));
	});
	it('should return "abc" for select "@title"', function () {
		assert.equal("abc", dom.select('@title'));
	});
	it('should return "bar" for select "//children/*[1]/@foo"', function () {
		assert.equal("bar", dom.select('//children/*[1]/@foo'));
	});
	it('should return 2 for select "count(//@foo)"', function () {
		assert.equal(2, dom.select('count(//@foo)'));
	});
	it('should return 555 for select "//@foo[2]"', function () {
		assert.equal(555, dom.select('//@foo[2]'));
	});
	it('should return 2 for select "count(//children//*)"', function () {
		assert.equal(2, dom.select('count(//children//*)'));
	});
	it('should return "val" for select "//children/*[2]"', function () {
		assert.equal("val", dom.select('//children/*[2]'));
	});
	it('should return "string" for select "name(//children/*[2])"', function () {
		assert.equal("string", dom.select('name(//children/*[2])'));
	});
	it('should return "subData" for select "name(*/*[2])"', function () {
		assert.equal("subData", dom.select('name(*/*[2])'));
	});
	it('should return "val" for select "*/children/*[2]/text()"', function () {
		assert.equal("val", dom.select('*/children/*[2]/text()'));
	});
});

describe('Custom Adapter:', function () {
	var dom = jsel(data);
	dom.adapters(customAdapters);
	it('should return 5 for select "count(//*)"', function () {
		assert.equal(5, dom.select('count(//*)'));
	});
	it('should return "val3" for select "//foo1/text()"', function () {
		assert.equal('val3', dom.select('//foo1/text()'));
	});
	it('should return 5 for select "//element2/@id"', function () {
		assert.equal(5, dom.select('//element2/@id'));
	});
	it('should return 2 for select "count(//*[@egg])"', function () {
		assert.equal(2, dom.select('count(//*[@egg])'));
	});
});

describe('Custom Mappings with Adapters:', function() {
	var dom = jsel(data);
	dom.adapters(customAdapters).map(customMappings);
	it('should return 1 for select "count(//e1)"', function () {
		assert.equal(1, dom.select('count(//e1)'));
	});
	it('should return 1 for select "count(//e2)"', function () {
		assert.equal(1, dom.select('count(//e2)'));
	});
});

describe('Custom Mappings Attributes:', function() {
	var dom = jsel({foo:'abc'});
	dom.map({
		"z": "foo"
	});
	it('should return "abc" for select "@z"', function () {
		assert.equal('abc', dom.select("@z"));
	});
});