(function () {
	'use strict';

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
		var fileList = document.getElementById('file-list');
		var mapHeightInput = document.getElementById('gpx-editor-map-height');
		var profileHeightInput = document.getElementById('gpx-editor-profile-height');

		// A GPX attachment is one whose displayed filename ends in .gpx.
		function isGpx(name) {
			return /\.gpx$/i.test(String(name || '').trim());
		}

		function isOpen() {
			return !panel.classList.contains('hidden');
		}

		function setOpen(open) {
			panel.classList.toggle('hidden', !open);
			button.setAttribute('aria-expanded', open ? 'true' : 'false');

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

		// A filled size field is a bare pixel count (1-2000). A blank or invalid
		// value means "use the board default", so the key is left out of the tag.
		function sizeKey(name, input) {
			if (!input) {
				return '';
			}

			var raw = input.value.trim();

			if (!/^\d+$/.test(raw)) {
				return '';
			}

			var value = parseInt(raw, 10);

			if (value < 1 || value > 2000) {
				return '';
			}

			return ' ' + name + '=' + value;
		}

		function insert(attachId) {
			var tag = '[gpx=' + attachId
				+ sizeKey('map-height', mapHeightInput)
				+ sizeKey('profile-height', profileHeightInput)
				+ ']';

			// insert_text() is phpBB's global editor helper (editor.js).
			if (typeof insert_text === 'function') {
				insert_text(tag);
			}

			if (mapHeightInput) {
				mapHeightInput.value = '';
			}
			if (profileHeightInput) {
				profileHeightInput.value = '';
			}

			var textarea = document.getElementById('message');
			if (textarea) {
				textarea.focus();
			}

			setOpen(false);
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

				link.addEventListener('click', function () {
					insert(item.id);
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
			setOpen(!isOpen());
		});

		if (closeButton) {
			closeButton.addEventListener('click', function () {
				setOpen(false);
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
