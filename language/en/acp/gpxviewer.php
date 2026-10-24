<?php
/**
 *
 * GPX Viewer. An extension for the phpBB Forum Software package.
 *
 * @copyright (c) 2026 Hugo
 * @license GNU General Public License, version 2 (GPL-2.0)
 *
 */

if (!defined('IN_PHPBB'))
{
	exit;
}

if (empty($lang) || !is_array($lang))
{
	$lang = [];
}

$lang = array_merge($lang, [
	'ACP_GPXVIEWER_EXPLAIN'				=> 'These settings control the map and elevation profile that the GPX Viewer draws inside posts. Changes take effect on every viewer the next time it is rendered.',

	'ACP_GPXVIEWER_TILE'				=> 'Map tiles',
	'ACP_GPXVIEWER_TILE_URL'			=> 'Tile URL',
	'ACP_GPXVIEWER_TILE_URL_EXPLAIN'	=> 'The tile server URL template, e.g. <samp>https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png</samp>. Keep <samp>{s}</samp>, <samp>{z}</samp>, <samp>{x}</samp> and <samp>{y}</samp> as placeholders.',
	'ACP_GPXVIEWER_TILE_URL_REQUIRED'	=> 'You must enter a tile URL.',
	'ACP_GPXVIEWER_ATTRIBUTION'			=> 'Attribution',
	'ACP_GPXVIEWER_ATTRIBUTION_EXPLAIN'	=> 'The attribution text shown in the map corner. Basic HTML links are allowed. Check that your tile provider’s terms permit your usage.',

	'ACP_GPXVIEWER_SIZING'					=> 'Viewer sizing',
	'ACP_GPXVIEWER_MAP_HEIGHT'				=> 'Map height',
	'ACP_GPXVIEWER_MAP_HEIGHT_EXPLAIN'		=> 'The height of the map in pixels.',
	'ACP_GPXVIEWER_MAP_HEIGHT_REQUIRED'		=> 'The map height must be a positive number of pixels.',
	'ACP_GPXVIEWER_PROFILE_HEIGHT'			=> 'Profile height',
	'ACP_GPXVIEWER_PROFILE_HEIGHT_EXPLAIN'	=> 'The height of the elevation profile in pixels.',
	'ACP_GPXVIEWER_PROFILE_HEIGHT_REQUIRED'	=> 'The profile height must be a positive number of pixels.',
	'ACP_GPXVIEWER_MAX_ZOOM'				=> 'Maximum zoom',
	'ACP_GPXVIEWER_MAX_ZOOM_EXPLAIN'		=> 'The highest zoom level readers can reach on the map.',
	'ACP_GPXVIEWER_MAX_ZOOM_RANGE'			=> 'The maximum zoom must be between 1 and 22.',
	'ACP_GPXVIEWER_PIXELS'					=> 'pixels',

	'ACP_GPXVIEWER_SETTING_SAVED'			=> 'GPX Viewer settings have been saved successfully.',
]);
