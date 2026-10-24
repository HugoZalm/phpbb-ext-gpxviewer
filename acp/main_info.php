<?php
/**
 *
 * GPX Viewer. An extension for the phpBB Forum Software package.
 *
 * @copyright (c) 2026 Hugo
 * @license GNU General Public License, version 2 (GPL-2.0)
 *
 */

namespace hugozalm\gpxviewer\acp;

/**
 * GPX Viewer ACP module info.
 */
class main_info
{
	public function module()
	{
		return [
			'filename'	=> '\hugozalm\gpxviewer\acp\main_module',
			'title'		=> 'ACP_GPXVIEWER_TITLE',
			'modes'		=> [
				'settings'	=> [
					'title'	=> 'ACP_GPXVIEWER',
					'auth'	=> 'ext_hugozalm/gpxviewer && acl_a_board',
					'cat'	=> ['ACP_GPXVIEWER_TITLE'],
				],
			],
		];
	}
}
