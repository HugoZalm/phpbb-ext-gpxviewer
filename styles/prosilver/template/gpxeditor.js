(function () {
	'use strict';

	// A [gpx=N ...] tag in the message text, with its key=value pairs.
	var TAG_PATTERN = /\[gpx=(\d+)([^\]]*)\]/gi;
	var KEY_PATTERN = /(map-height|profile-height|max-zoom)=(\d+)/gi;

	// Find the tag a caret at "from" is strictly inside of (not just before its
	// "[" or just after its "]"), so a caret left behind a freshly inserted tag
	// still means "insert another one". With a selection ("from" to "to"), find
	// the first tag it overlaps; merely touching the "[" or "]" does not count.
	function findTagAt(text, from, to) {
		var match;

		if (to === undefined) {
			to = from;
		}

		TAG_PATTERN.lastIndex = 0;

		while ((match = TAG_PATTERN.exec(text)) !== null) {
			var start = match.index;
			var end = start + match[0].length;
			var overlaps;

			if (to === from) {
				overlaps = from > start && from < end;
			} else {
				overlaps = from < end && to > start;
			}

			if (overlaps) {
				var values = {};
				var pair;

				KEY_PATTERN.lastIndex = 0;

				while ((pair = KEY_PATTERN.exec(match[2])) !== null) {
					values[pair[1].toLowerCase()] = pair[2];
				}

				return { start: start, end: end, id: match[1], values: values };
			}

			if (start >= to) {
				break;
			}
		}

		return null;
	}

	function init() {
		var button = document.getElementById('gpx-editor-button');
		var panel = document.getElementById('gpx-editor-panel');

		if (!button || !panel) {
			return;
		}

		var list = document.getElementById('gpx-editor-list');
		var empty = document.getElementById('gpx-editor-empty');
		var fileInput = document.getElementById('gpx-editor-file');
		var closeButton = document.getElementById('gpx-editor-close');
		var applyButton = document.getElementById('gpx-editor-apply');
		var title = document.getElementById('gpx-editor-title');
		var hint = document.getElementById('gpx-editor-hint');
		var fileList = document.getElementById('file-list');
		var textarea = document.getElementById('message');

		var fields = [
			{ key: 'map-height', input: document.getElementById('gpx-editor-map-height') },
			{ key: 'profile-height', input: document.getElementById('gpx-editor-profile-height') },
			{ key: 'max-zoom', input: document.getElementById('gpx-editor-max-zoom') }
		];

		var buttonTitle = button.getAttribute('title') || '';

		// The tag being edited, or null when the panel inserts a new one.
		var editing = null;

		// A GPX attachment is one whose displayed filename ends in .gpx.
		function isGpx(name) {
			return /\.gpx$/i.test(String(name || '').trim());
		}

		function isOpen() {
			return !panel.classList.contains('hidden');
		}

		// Swap a text between its insert and edit variant, both kept in data-
		// attributes on the element so this script needs no language strings.
		function setMode(el, edit) {
			if (!el) {
				return;
			}

			var text = el.getAttribute(edit ? 'data-text-edit' : 'data-text-insert');

			if (text !== null) {
				el.textContent = text;
			}
		}

		function setOpen(open) {
			panel.classList.toggle('hidden', !open);
			button.setAttribute('aria-expanded', open ? 'true' : 'false');

			if (!open) {
				editing = null;
			}

			setMode(title, !!editing);
			setMode(hint, !!editing);

			if (applyButton) {
				applyButton.classList.toggle('hidden', !editing);
			}

			if (open) {
				refresh();
			}
		}

		// Read the post's current attachments from phpBB's own attach list.
		function collect() {
			var items = [];

			if (!fileList) {
				return items;
			}

			var rows = fileList.querySelectorAll('.attach-row[data-attach-id]');

			for (var i = 0; i < rows.length; i++) {
				var nameEl = rows[i].querySelector('.file-name');
				var name = nameEl ? nameEl.textContent : '';

				if (isGpx(name)) {
					items.push({
						id: rows[i].getAttribute('data-attach-id'),
						name: name.trim()
					});
				}
			}

			return items;
		}

		// A field holds a bare integer from 1 to the input's max (2000 px for the
		// sizes, the board's max zoom for the zoom level).
		function validNumber(raw, max) {
			raw = String(raw === null || raw === undefined ? '' : raw).trim();

			if (!/^\d+$/.test(raw)) {
				return null;
			}

			var value = parseInt(raw, 10);

			return (value >= 1 && value <= max) ? value : null;
		}

		// Every tag carries all keys. A blank or invalid field falls back to the
		// board default, which the template puts in the input's placeholder.
		function numberKey(field) {
			var input = field.input;

			if (!input) {
				return '';
			}

			var max = parseInt(input.max, 10) || 2000;
			var value = validNumber(input.value, max);

			if (value === null) {
				value = validNumber(input.placeholder, max);
			}

			return value === null ? '' : ' ' + field.key + '=' + value;
		}

		function buildTag(attachId) {
			return '[gpx=' + attachId + fields.map(numberKey).join('') + ']';
		}

		// Fill each field from the tag being edited, or with the board default
		// for a key the tag leaves out (and for every key when inserting).
		function fillFields(values) {
			fields.forEach(function (field) {
				if (field.input) {
					var value = values ? values[field.key] : undefined;
					field.input.value = value !== undefined ? value : field.input.placeholder;
				}
			});
		}

		function tagAtCaret() {
			if (!textarea || typeof textarea.selectionStart !== 'number') {
				return null;
			}

			return findTagAt(textarea.value, textarea.selectionStart, textarea.selectionEnd);
		}

		function openForInsert() {
			editing = null;
			fillFields(null);
			setOpen(true);
		}

		function openForEdit(tag) {
			editing = tag;
			fillFields(tag.values);
			setOpen(true);
		}

		function insert(attachId) {
			// insert_text() is phpBB's global editor helper (editor.js).
			if (typeof insert_text === 'function') {
				insert_text(buildTag(attachId));
			}

			if (textarea) {
				textarea.focus();
			}

			setOpen(false);
			updateHint();
		}

		// Replace the edited tag's text in place. The tag is looked up again at
		// its old position in case the message changed while the panel was open.
		function apply(attachId) {
			var tag = editing && textarea ? findTagAt(textarea.value, editing.start + 1) : null;

			if (!tag) {
				insert(attachId);
				return;
			}

			var replacement = buildTag(attachId);
			var caret = tag.start + replacement.length;

			textarea.value = textarea.value.slice(0, tag.start) + replacement + textarea.value.slice(tag.end);
			textarea.focus();
			textarea.setSelectionRange(caret, caret);
			textarea.dispatchEvent(new Event('input', { bubbles: true }));

			setOpen(false);
			updateHint();
		}

		// Show on the toolbar button that clicking it edits the tag at the caret.
		function updateHint() {
			var inTag = !!tagAtCaret();
			var editTitle = button.getAttribute('data-title-edit');

			button.classList.toggle('gpx-editor-button--edit', inTag);
			button.setAttribute('title', inTag && editTitle ? editTitle : buttonTitle);
		}

		function refresh() {
			var items = collect();

			list.innerHTML = '';

			items.forEach(function (item) {
				var entry = document.createElement('li');
				var link = document.createElement('button');

				link.type = 'button';
				link.className = 'gpx-editor-item';
				link.textContent = item.name;
				link.setAttribute('data-attach-id', item.id);

				if (editing && editing.id === item.id) {
					link.classList.add('is-current');
					link.setAttribute('aria-current', 'true');
				}

				link.addEventListener('click', function () {
					if (editing) {
						apply(item.id);
					} else {
						insert(item.id);
					}
				});

				entry.appendChild(link);
				list.appendChild(entry);
			});

			empty.classList.toggle('hidden', items.length > 0);
			list.classList.toggle('hidden', items.length === 0);
		}

		// Hand the chosen file to phpBB's own uploader. Its own pipeline then
		// inserts the attach row (with data-attach-id) that we observe below.
		function upload(files) {
			var uploader = window.phpbb && phpbb.plupload && phpbb.plupload.uploader;

			if (!uploader || !files) {
				return;
			}

			for (var i = 0; i < files.length; i++) {
				if (isGpx(files[i].name)) {
					uploader.addFile(files[i]);
				}
			}
		}

		button.addEventListener('click', function (e) {
			e.preventDefault();

			if (isOpen()) {
				setOpen(false);
				return;
			}

			var tag = tagAtCaret();

			if (tag) {
				openForEdit(tag);
			} else {
				openForInsert();
			}
		});

		if (applyButton) {
			applyButton.addEventListener('click', function () {
				if (editing) {
					apply(editing.id);
				}
			});
		}

		if (closeButton) {
			closeButton.addEventListener('click', function () {
				setOpen(false);
			});
		}

		if (textarea) {
			// Double-clicking inside a [gpx] tag opens the panel to edit it.
			textarea.addEventListener('dblclick', function () {
				var tag = tagAtCaret();

				if (tag) {
					openForEdit(tag);
				}
			});

			['click', 'keyup', 'select', 'focus'].forEach(function (type) {
				textarea.addEventListener(type, updateHint);
			});
		}

		document.addEventListener('click', function (e) {
			if (isOpen() && !panel.contains(e.target) && !button.contains(e.target)) {
				setOpen(false);
			}
		});

		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && isOpen()) {
				setOpen(false);
			}
		});

		if (fileInput) {
			fileInput.addEventListener('change', function () {
				upload(fileInput.files);
				fileInput.value = '';
			});
		}

		// Keep the panel in step with uploads and deletions in the attach list.
		if (fileList && typeof MutationObserver === 'function') {
			new MutationObserver(refresh).observe(fileList, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ['data-attach-id']
			});
		}

		refresh();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
