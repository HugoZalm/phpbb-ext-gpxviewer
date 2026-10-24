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
	'ACP_GPXVIEWER_TITLE'	=> 'GPX Viewer',
	'ACP_GPXVIEWER'			=> 'GPX Viewer-instellingen',

	'LOG_ACP_GPXVIEWER_SETTINGS'	=> '<strong>GPX Viewer-instellingen bijgewerkt</strong>',
]);
