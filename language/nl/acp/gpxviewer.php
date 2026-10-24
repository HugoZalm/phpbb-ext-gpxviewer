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
	'ACP_GPXVIEWER_EXPLAIN'				=> 'Deze instellingen bepalen de kaart en het hoogteprofiel die de GPX Viewer in berichten tekent. Wijzigingen worden doorgevoerd zodra een viewer opnieuw wordt weergegeven.',

	'ACP_GPXVIEWER_TILE'				=> 'Kaarttegels',
	'ACP_GPXVIEWER_TILE_URL'			=> 'Tegel-URL',
	'ACP_GPXVIEWER_TILE_URL_EXPLAIN'	=> 'De URL-sjabloon van de tegelserver, bijvoorbeeld <samp>https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png</samp>. Laat <samp>{s}</samp>, <samp>{z}</samp>, <samp>{x}</samp> en <samp>{y}</samp> als plaatsaanduidingen staan.',
	'ACP_GPXVIEWER_TILE_URL_REQUIRED'	=> 'Je moet een tegel-URL invoeren.',
	'ACP_GPXVIEWER_ATTRIBUTION'			=> 'Attributie',
	'ACP_GPXVIEWER_ATTRIBUTION_EXPLAIN'	=> 'De attributietekst die in de hoek van de kaart wordt getoond. Eenvoudige HTML-links zijn toegestaan. Controleer of de voorwaarden van je tegelprovider je gebruik toestaan.',

	'ACP_GPXVIEWER_SIZING'					=> 'Afmetingen van de viewer',
	'ACP_GPXVIEWER_MAP_HEIGHT'				=> 'Hoogte van de kaart',
	'ACP_GPXVIEWER_MAP_HEIGHT_EXPLAIN'		=> 'De hoogte van de kaart in pixels.',
	'ACP_GPXVIEWER_MAP_HEIGHT_REQUIRED'		=> 'De hoogte van de kaart moet een positief aantal pixels zijn.',
	'ACP_GPXVIEWER_PROFILE_HEIGHT'			=> 'Hoogte van het hoogteprofiel',
	'ACP_GPXVIEWER_PROFILE_HEIGHT_EXPLAIN'	=> 'De hoogte van het hoogteprofiel in pixels.',
	'ACP_GPXVIEWER_PROFILE_HEIGHT_REQUIRED'	=> 'De hoogte van het hoogteprofiel moet een positief aantal pixels zijn.',
	'ACP_GPXVIEWER_MAX_ZOOM'				=> 'Maximale zoom',
	'ACP_GPXVIEWER_MAX_ZOOM_EXPLAIN'		=> 'Het hoogste zoomniveau dat lezers op de kaart kunnen bereiken.',
	'ACP_GPXVIEWER_MAX_ZOOM_RANGE'			=> 'De maximale zoom moet tussen 1 en 22 liggen.',
	'ACP_GPXVIEWER_PIXELS'					=> 'pixels',

	'ACP_GPXVIEWER_SETTING_SAVED'			=> 'De GPX Viewer-instellingen zijn opgeslagen.',
]);
