// Behaviour tests for the GPX editor panel (styles/prosilver/template/gpxeditor.js):
// the panel lists only .gpx attachments, inserts [gpx=N] with all of the
// map-height/profile-height/max-zoom keys (blank fields fall back to the board
// defaults in the placeholders), and edits an existing tag at the caret in place.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const SRC = path.join(__dirname, '..', '..', 'styles', 'prosilver', 'template', 'gpxeditor.js');
const code = fs.readFileSync(SRC, 'utf8');

const html = `<!DOCTYPE html><html><body>
  <span class="gpx-editor-wrap">
    <button type="button" id="gpx-editor-button" aria-expanded="false" title="Insert" data-title-edit="Edit"></button>
    <div id="gpx-editor-panel" class="hidden">
      <strong id="gpx-editor-title" data-text-insert="Insert GPX route" data-text-edit="Edit GPX route">Insert GPX route</strong>
      <button type="button" id="gpx-editor-close"></button>
      <p id="gpx-editor-hint" data-text-insert="insert hint" data-text-edit="edit hint">insert hint</p>
      <input type="number" id="gpx-editor-map-height" class="gpx-editor-size" min="1" max="2000" placeholder="450">
      <input type="number" id="gpx-editor-profile-height" class="gpx-editor-size" min="1" max="2000" placeholder="180">
      <input type="number" id="gpx-editor-max-zoom" class="gpx-editor-size" min="1" max="19" placeholder="19">
      <button type="button" id="gpx-editor-apply" class="hidden"></button>
      <ul id="gpx-editor-list" class="hidden"></ul>
      <p id="gpx-editor-empty">empty</p>
      <input type="file" id="gpx-editor-file">
    </div>
  </span>
  <table><tbody id="file-list">
    <tr class="attach-row" data-attach-id="7"><td class="attach-name"><span class="file-name"><a href="#">route.gpx</a></span></td></tr>
    <tr class="attach-row" data-attach-id="8"><td class="attach-name"><span class="file-name">photo.jpg</span></td></tr>
    <tr class="attach-row" data-attach-id="9"><td class="attach-name"><span class="file-name">other.gpx</span></td></tr>
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
const title = doc.getElementById('gpx-editor-title');
const applyButton = doc.getElementById('gpx-editor-apply');
const mapHeight = doc.getElementById('gpx-editor-map-height');
const profileHeight = doc.getElementById('gpx-editor-profile-height');
const maxZoom = doc.getElementById('gpx-editor-max-zoom');
const message = doc.getElementById('message');
const closeButton = doc.getElementById('gpx-editor-close');

const DEFAULT_TAG = '[gpx=7 map-height=450 profile-height=180 max-zoom=19]';

const sleep = () => new Promise((r) => setTimeout(r, 20));

let failures = 0;
function assert(name, cond) {
	console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
	if (!cond) {
		failures++;
	}
}

function entry(id) {
	return list.querySelector('li button[data-attach-id="' + id + '"]');
}

function isOpen() {
	return !panel.classList.contains('hidden');
}

function select(start, end) {
	message.focus();
	message.setSelectionRange(start, end);
	message.dispatchEvent(new window.Event('select'));
}

function setCaret(pos) {
	select(pos, pos);
}

// Select a range, click the GPX button and report the panel's mode.
function modeForSelection(start, end) {
	select(start, end);
	button.click();
	const mode = !isOpen() ? 'closed' : title.textContent === 'Edit GPX route' ? 'edit' : 'insert';
	closeButton.click();
	return mode;
}

function dblclickMessage() {
	message.dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true }));
}

(async () => {
	await sleep();

	const items = () => list.querySelectorAll('li');
	assert('filters to the .gpx attachments', items().length === 2);
	assert('shows the .gpx filename', items()[0].textContent === 'route.gpx');
	assert('carries the attach id', items()[0].querySelector('button').getAttribute('data-attach-id') === '7');
	assert('non-.gpx is excluded', !list.textContent.includes('photo.jpg'));
	assert('list visible, empty hidden', !list.classList.contains('hidden') && empty.classList.contains('hidden'));

	// --- Insert mode ---------------------------------------------------------

	button.click();
	assert('panel opens on button click', isOpen());
	assert('insert mode title', title.textContent === 'Insert GPX route');
	assert('apply hidden in insert mode', applyButton.classList.contains('hidden'));
	assert(
		'fields open filled with the board defaults',
		mapHeight.value === '450' && profileHeight.value === '180' && maxZoom.value === '19'
	);

	entry(7).click();
	assert('defaults insert all keys', inserted[0] === DEFAULT_TAG);
	assert('panel closes after insert', !isOpen());

	button.click();
	mapHeight.value = '500';
	profileHeight.value = '250';
	maxZoom.value = '15';
	entry(7).click();
	assert(
		'filled fields insert their values',
		inserted[1] === '[gpx=7 map-height=500 profile-height=250 max-zoom=15]'
	);

	button.click();
	assert('fields are reset to the defaults on reopening', mapHeight.value === '450' && maxZoom.value === '19');
	mapHeight.value = '';
	profileHeight.value = '';
	maxZoom.value = '';
	entry(7).click();
	assert('blank fields fall back to the defaults', inserted[2] === DEFAULT_TAG);

	button.click();
	mapHeight.value = '3000';
	profileHeight.value = '0';
	maxZoom.value = '25';
	entry(7).click();
	assert('out-of-range values fall back to the defaults', inserted[3] === DEFAULT_TAG);

	// jsdom sanitizes non-numeric values of type=number to "".
	button.click();
	mapHeight.value = '12.5';
	profileHeight.value = 'abc';
	entry(7).click();
	assert('non-integer values fall back to the defaults', inserted[4] === DEFAULT_TAG);

	// --- Edit mode -----------------------------------------------------------

	const before = 'Look at this: ';
	const tag = '[gpx=7 map-height=300]';
	const after = ' and this [gpx=9] too.';
	message.value = before + tag + after;

	setCaret(before.length + 3);
	message.dispatchEvent(new window.Event('keyup'));
	assert('button shows the edit hint with the caret in a tag', button.classList.contains('gpx-editor-button--edit'));
	assert('button title switches to edit', button.getAttribute('title') === 'Edit');

	dblclickMessage();
	assert('double-click inside a tag opens the panel', isOpen());
	assert('edit mode title', title.textContent === 'Edit GPX route');
	assert('apply shown in edit mode', !applyButton.classList.contains('hidden'));
	assert(
		'fields are filled from the tag, missing keys get defaults',
		mapHeight.value === '300' && profileHeight.value === '180' && maxZoom.value === '19'
	);
	assert('the tag\'s attachment is marked current', entry(7).classList.contains('is-current'));
	assert('other attachments are not marked current', !entry(9).classList.contains('is-current'));

	let inputEvents = 0;
	message.addEventListener('input', () => inputEvents++);

	profileHeight.value = '200';
	applyButton.click();
	const edited = '[gpx=7 map-height=300 profile-height=200 max-zoom=19]';
	assert('apply rewrites only the tag under the caret', message.value === before + edited + after);
	assert('apply fires an input event', inputEvents === 1);
	assert('panel closes after apply', !isOpen());
	assert('caret ends after the rewritten tag', message.selectionStart === before.length + edited.length);
	assert('nothing was inserted while editing', inserted.length === 5);

	// Edit the second tag and switch its route by clicking another attachment.
	const second = message.value.indexOf('[gpx=9]');
	setCaret(second + 2);
	button.click();
	assert('toolbar button opens edit mode with the caret in a tag', isOpen() && title.textContent === 'Edit GPX route');
	assert('second tag\'s attachment is current', entry(9).classList.contains('is-current'));
	entry(7).click();
	assert(
		'clicking another attachment switches the route in place',
		message.value === before + edited + ' and this ' + DEFAULT_TAG + ' too.'
	);

	// Caret just after a tag's "]" means insert, not edit.
	setCaret(before.length + edited.length);
	message.dispatchEvent(new window.Event('keyup'));
	assert('edit hint off with the caret after a tag', !button.classList.contains('gpx-editor-button--edit'));
	button.click();
	assert('button opens insert mode with the caret outside a tag', title.textContent === 'Insert GPX route');
	entry(7).click();
	assert('insert mode still inserts', inserted.length === 6 && inserted[5] === DEFAULT_TAG);

	// Double-clicking outside a tag does nothing.
	setCaret(2);
	dblclickMessage();
	assert('double-click outside a tag keeps the panel closed', !isOpen());

	// --- Selection -----------------------------------------------------------

	// A selection overlapping a tag edits it; one that only touches its "[" or
	// "]" from outside does not, in line with the caret rule above.
	const selBefore = 'See ';
	const selTag = '[gpx=9 max-zoom=12]';
	message.value = selBefore + selTag + ' here.';
	const tagStart = selBefore.length;
	const tagEnd = tagStart + selTag.length;

	select(tagStart, tagEnd);
	assert('edit hint on with the whole tag selected', button.classList.contains('gpx-editor-button--edit'));
	assert('button title switches to edit with a selected tag', button.getAttribute('title') === 'Edit');
	button.click();
	assert('selecting the whole tag opens edit mode', isOpen() && title.textContent === 'Edit GPX route');
	assert('selected tag\'s attachment is current', entry(9).classList.contains('is-current'));
	assert('fields are filled from the selected tag', maxZoom.value === '12');
	closeButton.click();

	assert('a selection overlapping the tag\'s start opens edit mode', modeForSelection(1, tagStart + 3) === 'edit');
	assert('a selection overlapping the tag\'s end opens edit mode', modeForSelection(tagEnd - 2, tagEnd + 3) === 'edit');
	assert('a selection ending at the tag\'s "[" opens insert mode', modeForSelection(0, tagStart) === 'insert');
	assert('a selection starting after the tag\'s "]" opens insert mode', modeForSelection(tagEnd, tagEnd + 3) === 'insert');
	assert('a selection away from any tag opens insert mode', modeForSelection(0, 2) === 'insert');

	select(0, tagStart);
	assert('edit hint off with a selection ending at the tag\'s "["', !button.classList.contains('gpx-editor-button--edit'));
	select(0, 2);
	assert('edit hint off with a selection away from any tag', !button.classList.contains('gpx-editor-button--edit'));
	assert('button title back to insert', button.getAttribute('title') === 'Insert');

	// A selection spanning two tags edits the first one.
	message.value = '[gpx=7] and [gpx=9]';
	select(0, message.value.length);
	button.click();
	assert('a selection spanning two tags edits the first', isOpen() && entry(7).classList.contains('is-current') && !entry(9).classList.contains('is-current'));
	closeButton.click();

	process.exitCode = failures ? 1 : 0;
	if (!failures) {
		console.log('All editor panel assertions passed.');
	}
})();
