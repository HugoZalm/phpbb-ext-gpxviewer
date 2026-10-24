<?php
/**
 *
 * GPX Viewer. An extension for the phpBB Forum Software package.
 *
 * @copyright (c) 2026 Hugo
 * @license GNU General Public License, version 2 (GPL-2.0)
 *
 */

namespace hugozalm\gpxviewer\event;

/**
 * @ignore
 */
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * GPX Viewer event listener.
 */
class main_listener implements EventSubscriberInterface
{
	/** @var \phpbb\template\template */
	protected $template;

	/** @var \phpbb\language\language */
	protected $language;

	/** @var \phpbb\config\config */
	protected $config;

	/**
	 * Constructor
	 *
	 * @param \phpbb\template\template	$template	Template object
	 * @param \phpbb\language\language	$language	Language object
	 * @param \phpbb\config\config		$config		Config object
	 */
	public function __construct(\phpbb\template\template $template, \phpbb\language\language $language, \phpbb\config\config $config)
	{
		$this->template = $template;
		$this->language = $language;
		$this->config = $config;
	}

	/**
	 * Map phpBB core events to the listener methods that should handle those events
	 *
	 * @return array
	 */
	public static function getSubscribedEvents()
	{
		return [
			'core.text_formatter_s9e_render_before'	=> 'detect_gpx_tag',
			'core.posting_modify_template_vars'		=> 'load_editor_language',
		];
	}

	/**
	 * Make the viewer's script available on pages that render a GPX tag
	 *
	 * Runs for every text the formatter renders, including the posting preview,
	 * so the assets are only requested when a viewer is actually on the page.
	 *
	 * @param \phpbb\event\data	$event	Event object
	 */
	public function detect_gpx_tag($event)
	{
		if (!preg_match('#<GPX[\s/>]#', $event['xml']))
		{
			return;
		}

		$this->template->assign_vars([
			'S_GPX_VIEWER'			=> true,
			'GPX_VIEWER_SCRIPT'		=> generate_board_url() . '/ext/hugozalm/gpxviewer/assets/js/webcomponent.js',
			'GPX_VIEWER_CONFIG'		=> $this->viewer_config(),
		]);
	}

	/**
	 * Build the page-level configuration object the component reads, as a JSON
	 * string. Hex-encoding of tag/amp/quote characters keeps it safe to embed in
	 * a <script> block.
	 *
	 * @return string
	 */
	protected function viewer_config()
	{
		$config = [
			'tileUrl'		=> isset($this->config['gpxviewer_tile_url']) ? (string) $this->config['gpxviewer_tile_url'] : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			'attribution'	=> isset($this->config['gpxviewer_attribution']) ? (string) $this->config['gpxviewer_attribution'] : '',
			'maxZoom'		=> isset($this->config['gpxviewer_max_zoom']) ? (int) $this->config['gpxviewer_max_zoom'] : 19,
			'mapHeight'		=> (isset($this->config['gpxviewer_map_height']) ? (int) $this->config['gpxviewer_map_height'] : 450) . 'px',
			'profileHeight'	=> (isset($this->config['gpxviewer_profile_height']) ? (int) $this->config['gpxviewer_profile_height'] : 180) . 'px',
		];

		return json_encode($config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
	}

	/**
	 * Make the editor panel's language strings available on the posting screen
	 *
	 * Runs once while the posting page (including the preview) is built, before
	 * the toolbar template is rendered.
	 *
	 * @param \phpbb\event\data	$event	Event object
	 */
	public function load_editor_language($event)
	{
		$this->language->add_lang('common', 'hugozalm/gpxviewer');

		// Show the board's current defaults as the panel fields' placeholders, so
		// authors can see what a blank field means.
		$this->template->assign_vars([
			'GPX_PANEL_MAP_HEIGHT_DEFAULT'		=> isset($this->config['gpxviewer_map_height']) ? (int) $this->config['gpxviewer_map_height'] : 450,
			'GPX_PANEL_PROFILE_HEIGHT_DEFAULT'	=> isset($this->config['gpxviewer_profile_height']) ? (int) $this->config['gpxviewer_profile_height'] : 180,
		]);
	}
}
