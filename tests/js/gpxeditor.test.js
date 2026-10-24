// Behaviour tests for the GPX editor panel (styles/prosilver/template/gpxeditor.js):
// the panel lists only .gpx attachments and inserts [gpx=N] with optional
// map-height/profile-height keys drawn from the two size fields.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const SRC = path.join(__dirname, '..', '..', 'styles', 'prosilver', 'template', 'gpxeditor.js');
const code = fs.readFileSync(SRC, 'utf8');

const html = `<!DOCTYPE html><html><body>
  <span class="gpx-editor-wrap">
    <button type="button" id="gpx-editor-button" aria-expanded="false"></button>
    <div id="gpx-editor-panel" class="hidden">
      <button type="button" id="gpx-editor-close"></button>
      <input type="number" id="gpx-editor-map-height" class="gpx-editor-size">
      <input type="number" id="gpx-editor-profile-height" class="gpx-editor-size">
      <ul id="gpx-editor-list" class="hidden"></ul>
      <p id="gpx-editor-empty">empty</p>
      <input type="file" id="gpx-editor-file">
    </div>
  </span>
  <table><tbody id="file-list">
    <tr class="attach-row" data-attach-id="7"><td class="attach-name"><span class="file-name"><a href="#">route.gpx</a></span></td></tr>
    <tr class="attach-row" data-attach-id="8"><td class="attach-name"><span class="file-name">photo.jpg</span></td></tr>
  </tbody></table>
  <textarea id="message"></textarea>
</body></html>`;

const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const doc = window.document;

const inserted = [];
window.insert_text = (t) => inserted.push(t);

window.eval(code);

const list = doc.getElementById('gpx-editor-list');
const panel = doc.getElementById('gpx-editor-panel');
const button = doc.getElementById('gpx-editor-button');
const empty = doc.getElementById('gpx-editor-empty');
const mapHeight = doc.getElementById('gpx-editor-map-height');
const profileHeight = doc.getElementById('gpx-editor-profile-height');

const sleep = () => new Promise((r) => setTimeout(r, 20));

let failures = 0;
function assert(name, cond) {
	console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
	if (!cond) {
		failures++;
	}
}

function clickEntry() {
	list.querySelector('li button').click();
}

(async () => {
	await sleep();

	const items = () => list.querySelectorAll('li');
	assert('filters to a single .gpx attachment', items().length === 1);
	assert('shows the .gpx filename', items()[0].textContent === 'route.gpx');
	assert('carries the attach id', items()[0].querySelector('button').getAttribute('data-attach-id') === '7');
	assert('non-.gpx is excluded', !list.textContent.includes('photo.jpg'));
	assert('list visible, empty hidden', !list.classList.contains('hidden') && empty.classList.contains('hidden'));

	button.click();
	assert('panel opens on button click', !panel.classList.contains('hidden'));

	// Blank fields -> plain tag.
	clickEntry();
	assert('blank fields insert [gpx=7]', inserted.length === 1 && inserted[0] === '[gpx=7]');
	assert('panel closes after insert', panel.classList.contains('hidden'));

	// Both fields -> both keys, in order.
	mapHeight.value = '500';
	profileHeight.value = '250';
	button.click();
	clickEntry();
	assert(
		'both fields insert map-height then profile-height',
		inserted[1] === '[gpx=7 map-height=500 profile-height=250]'
	);
	assert('fields are cleared after insert', mapHeight.value === '' && profileHeight.value === '');

	// Only the map field.
	mapHeight.value = '300';
	button.click();
	clickEntry();
	assert('only map field inserts map-height', inserted[2] === '[gpx=7 map-height=300]');

	// Only the profile field.
	profileHeight.value = '120';
	button.click();
	clickEntry();
	assert('only profile field inserts profile-height', inserted[3] === '[gpx=7 profile-height=120]');

	// Out-of-range and below-range values are dropped.
	mapHeight.value = '3000';
	profileHeight.value = '0';
	button.click();
	clickEntry();
	assert('out-of-range values are dropped', inserted[4] === '[gpx=7]');

	// Non-integer values are dropped (jsdom sanitizes type=number to "").
	mapHeight.value = '12.5';
	profileHeight.value = 'abc';
	button.click();
	clickEntry();
	assert('non-integer values are dropped', inserted[5] === '[gpx=7]');

	process.exitCode = failures ? 1 : 0;
	if (!failures) {
		console.log('All editor panel assertions passed.');
	}
})();
