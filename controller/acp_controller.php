<?php
/**
 *
 * GPX Viewer. An extension for the phpBB Forum Software package.
 *
 * @copyright (c) 2026 Hugo
 * @license GNU General Public License, version 2 (GPL-2.0)
 *
 */

namespace hugozalm\gpxviewer\controller;

/**
 * GPX Viewer ACP controller.
 */
class acp_controller
{
	/** @var \phpbb\config\config */
	protected $config;

	/** @var \phpbb\language\language */
	protected $language;

	/** @var \phpbb\log\log */
	protected $log;

	/** @var \phpbb\request\request */
	protected $request;

	/** @var \phpbb\template\template */
	protected $template;

	/** @var \phpbb\user */
	protected $user;

	/** @var string Custom form action */
	protected $u_action;

	/**
	 * Constructor.
	 *
	 * @param \phpbb\config\config		$config		Config object
	 * @param \phpbb\language\language	$language	Language object
	 * @param \phpbb\log\log			$log		Log object
	 * @param \phpbb\request\request	$request	Request object
	 * @param \phpbb\template\template	$template	Template object
	 * @param \phpbb\user				$user		User object
	 */
	public function __construct(\phpbb\config\config $config, \phpbb\language\language $language, \phpbb\log\log $log, \phpbb\request\request $request, \phpbb\template\template $template, \phpbb\user $user)
	{
		$this->config	= $config;
		$this->language	= $language;
		$this->log		= $log;
		$this->request	= $request;
		$this->template	= $template;
		$this->user		= $user;
	}

	/**
	 * Display the options a user can configure for this extension.
	 *
	 * @return void
	 */
	public function display_options()
	{
		// Add the language file with the settings strings
		$this->language->add_lang('acp/gpxviewer', 'hugozalm/gpxviewer');

		// Create a form key for preventing CSRF attacks
		add_form_key('gpxviewer_acp');

		// Create an array to collect errors that will be output to the user
		$errors = [];

		// Is the form being submitted to us?
		if ($this->request->is_set_post('submit'))
		{
			// Test if the submitted form is valid
			if (!check_form_key('gpxviewer_acp'))
			{
				$errors[] = $this->language->lang('FORM_INVALID');
			}

			// Both values are consumed verbatim (a JS URL template and a Leaflet
			// HTML attribution), so read them raw to avoid HTML entity escaping.
			$tile_url		= $this->request->raw_variable('gpxviewer_tile_url', '');
			$attribution	= $this->request->raw_variable('gpxviewer_attribution', '');
			$map_height		= $this->request->variable('gpxviewer_map_height', 0);
			$profile_height	= $this->request->variable('gpxviewer_profile_height', 0);
			$max_zoom		= $this->request->variable('gpxviewer_max_zoom', 0);

			if ($tile_url === '')
			{
				$errors[] = $this->language->lang('ACP_GPXVIEWER_TILE_URL_REQUIRED');
			}

			if ($map_height < 1)
			{
				$errors[] = $this->language->lang('ACP_GPXVIEWER_MAP_HEIGHT_REQUIRED');
			}

			if ($profile_height < 1)
			{
				$errors[] = $this->language->lang('ACP_GPXVIEWER_PROFILE_HEIGHT_REQUIRED');
			}

			if ($max_zoom < 1 || $max_zoom > 22)
			{
				$errors[] = $this->language->lang('ACP_GPXVIEWER_MAX_ZOOM_RANGE');
			}

			// If no errors, process the form data
			if (!count($errors))
			{
				$this->config->set('gpxviewer_tile_url', $tile_url);
				$this->config->set('gpxviewer_attribution', $attribution);
				$this->config->set('gpxviewer_map_height', $map_height);
				$this->config->set('gpxviewer_profile_height', $profile_height);
				$this->config->set('gpxviewer_max_zoom', $max_zoom);

				// Add option settings change action to the admin log
				$this->log->add('admin', $this->user->data['user_id'], $this->user->ip, 'LOG_ACP_GPXVIEWER_SETTINGS');

				// Option settings have been updated and logged.
				// Confirm this to the user and provide a link back to the previous page.
				trigger_error($this->language->lang('ACP_GPXVIEWER_SETTING_SAVED') . adm_back_link($this->u_action));
			}
		}

		$s_errors = !empty($errors);

		// Set output variables for display in the template
		$this->template->assign_vars([
			'S_ERROR'		=> $s_errors,
			'ERROR_MSG'		=> $s_errors ? implode('<br>', $errors) : '',

			'U_ACTION'		=> $this->u_action,

			'GPXVIEWER_TILE_URL'		=> $this->config['gpxviewer_tile_url'],
			'GPXVIEWER_ATTRIBUTION'		=> $this->config['gpxviewer_attribution'],
			'GPXVIEWER_MAP_HEIGHT'		=> (int) $this->config['gpxviewer_map_height'],
			'GPXVIEWER_PROFILE_HEIGHT'	=> (int) $this->config['gpxviewer_profile_height'],
			'GPXVIEWER_MAX_ZOOM'		=> (int) $this->config['gpxviewer_max_zoom'],
		]);
	}

	/**
	 * Set custom form action.
	 *
	 * @param string	$u_action	Custom form action
	 * @return void
	 */
	public function set_page_url($u_action)
	{
		$this->u_action = $u_action;
	}
}
