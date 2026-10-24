// Behaviour tests for the GPX web component (assets/js/webcomponent.js): a bare
// integer on the map-height/profile-height attributes is treated as pixels, an
// existing CSS unit is passed through, and a missing attribute uses the
// page-level configuration.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const SRC = path.join(__dirname, '..', '..', 'assets', 'js', 'webcomponent.js');
const code = fs.readFileSync(SRC, 'utf8');

const dom = new JSDOM(
	'<!DOCTYPE html><html><head>' +
		'<script src="http://localhost/ext/hugozalm/gpxviewer/assets/js/webcomponent.js"></script>' +
		'</head><body></body></html>',
	{ runScripts: 'outside-only', url: 'http://localhost/viewtopic.php' }
);
const { window } = dom;
const doc = window.document;

// Config default heights, as the extension emits them (already carrying px).
window.GPX_VIEWER_CONFIG = { mapHeight: '450px', profileHeight: '180px', maxZoom: 19 };

// A never-resolving fetch keeps connectedCallback from reaching the heavy
// Leaflet/D3 loading, so the containers it builds synchronously can be read.
window.fetch = () => new Promise(() => {});

window.eval(code);

let failures = 0;
function assert(name, cond) {
	console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
	if (!cond) {
		failures++;
	}
}

function makeViewer(attrs) {
	const el = doc.createElement('gpx-viewer');
	Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]));
	doc.body.appendChild(el);
	return el;
}

function heightOf(el, selector) {
	const node = el.querySelector(selector);
	return node ? node.getAttribute('style') : '';
}

// Bare integer map height -> px; missing profile -> config default.
const bare = makeViewer({ 'data-attach': '5', 'map-height': '320' });
assert('bare integer map-height becomes px', heightOf(bare, '.gpx-map') === 'height:320px');
assert('missing profile-height falls back to config', heightOf(bare, '.gpx-profile') === 'height:180px');

// Existing units pass through unchanged; bare integer profile -> px.
const units = makeViewer({ 'data-attach': '6', 'map-height': '50vh', 'profile-height': '120' });
assert('unit-bearing map-height passes through', heightOf(units, '.gpx-map') === 'height:50vh');
assert('bare integer profile-height becomes px', heightOf(units, '.gpx-profile') === 'height:120px');

// Out-of-range integers fall back to the config default.
const tooSmall = makeViewer({ 'data-attach': '8', 'map-height': '0' });
assert('below-range map-height falls back to config', heightOf(tooSmall, '.gpx-map') === 'height:450px');

const tooBig = makeViewer({ 'data-attach': '9', 'map-height': '5000' });
assert('above-range map-height falls back to config', heightOf(tooBig, '.gpx-map') === 'height:450px');

const upperBound = makeViewer({ 'data-attach': '10', 'map-height': '2000' });
assert('upper bound map-height is accepted', heightOf(upperBound, '.gpx-map') === 'height:2000px');

// No attributes at all -> both config defaults.
const defaults = makeViewer({ 'data-attach': '7' });
assert('no map-height uses config default', heightOf(defaults, '.gpx-map') === 'height:450px');
assert('no profile-height uses config default', heightOf(defaults, '.gpx-profile') === 'height:180px');

// max-zoom may only lower the board's limit.
assert('no max-zoom uses config default', defaults._maxZoom === 19);
assert('max-zoom below the board max is used', makeViewer({ 'data-attach': '11', 'max-zoom': '14' })._maxZoom === 14);
assert('max-zoom above the board max falls back', makeViewer({ 'data-attach': '12', 'max-zoom': '22' })._maxZoom === 19);
assert('empty max-zoom falls back', makeViewer({ 'data-attach': '13', 'max-zoom': '' })._maxZoom === 19);
assert('zero max-zoom falls back', makeViewer({ 'data-attach': '14', 'max-zoom': '0' })._maxZoom === 19);

process.exitCode = failures ? 1 : 0;
if (!failures) {
	console.log('All web component assertions passed.');
}
