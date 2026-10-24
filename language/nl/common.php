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

// DEVELOPERS PLEASE NOTE
//
// All language files should use UTF-8 as their encoding and the files must not contain a BOM.
//
// Placeholders can now contain order information, e.g. instead of
// 'Page %s of %s' you can (and should) write 'Page %1$s of %2$s', this allows
// translators to re-order the output of data while ensuring it remains correct
//
// You do not need this where single placeholders are used, e.g. 'Message %d' is fine
// equally where a string contains only two placeholders which are used to wrap text
// in a url you again do not need to specify an order e.g., 'Click %sHERE%s' is fine
//
// Some characters you may want to copy&paste:
// ’ » “ ” …
//

$lang = array_merge($lang, [
	'GPX_BUTTON'			=> 'GPX',
	'GPX_BUTTON_EXPLAIN'	=> 'Een GPX-route invoegen',
	'GPX_BUTTON_EDIT_EXPLAIN'	=> 'De GPX-route bij de cursor bewerken',
	'GPX_PANEL_TITLE'		=> 'GPX-route invoegen',
	'GPX_PANEL_TITLE_EDIT'	=> 'GPX-route bewerken',
	'GPX_PANEL_HINT'		=> 'Kies een GPX-bestand om de route in je bericht te plaatsen.',
	'GPX_PANEL_HINT_EDIT'	=> 'Pas de instellingen aan en klik op Toepassen, of kies een ander GPX-bestand.',
	'GPX_PANEL_APPLY'		=> 'Toepassen',
	'GPX_PANEL_MAP_HEIGHT'		=> 'Kaarthoogte (px)',
	'GPX_PANEL_PROFILE_HEIGHT'	=> 'Profielhoogte (px)',
	'GPX_PANEL_MAX_ZOOM'		=> 'Maximaal zoomniveau',
	'GPX_PANEL_EMPTY'		=> 'Er zijn nog geen GPX-bestanden aan dit bericht gekoppeld.',
	'GPX_PANEL_UPLOAD'		=> 'Een GPX-bestand uploaden',
	'GPX_PANEL_CLOSE'		=> 'Sluiten',
]);
