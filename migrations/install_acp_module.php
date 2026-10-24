<?php
/**
 *
 * GPX Viewer. An extension for the phpBB Forum Software package.
 *
 * @copyright (c) 2026 Hugo
 * @license GNU General Public License, version 2 (GPL-2.0)
 *
 */

namespace hugozalm\gpxviewer\migrations;

class install_acp_module extends \phpbb\db\migration\migration
{
	public function effectively_installed()
	{
		return isset($this->config['gpxviewer_tile_url']);
	}

	public static function depends_on()
	{
		return ['\phpbb\db\migration\data\v320\v320'];
	}

	public function update_data()
	{
		return [
			// Default configuration values (OpenStreetMap out of the box)
			['config.add', ['gpxviewer_tile_url', 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png']],
			['config.add', ['gpxviewer_attribution', '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>']],
			['config.add', ['gpxviewer_map_height', 450]],
			['config.add', ['gpxviewer_profile_height', 180]],
			['config.add', ['gpxviewer_max_zoom', 19]],

			// Add a "GPX Viewer" category under the Extensions tab ...
			['module.add', [
				'acp',
				'ACP_CAT_DOT_MODS',
				'ACP_GPXVIEWER_TITLE',
			]],
			// ... and the settings module inside it.
			['module.add', [
				'acp',
				'ACP_GPXVIEWER_TITLE',
				[
					'module_basename'	=> '\hugozalm\gpxviewer\acp\main_module',
					'modes'				=> ['settings'],
				],
			]],
		];
	}
}
