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

class install_gpx_bbcode extends \phpbb\db\migration\container_aware_migration
{
	public static function depends_on()
	{
		return [
			'\phpbb\db\migration\data\v320\v320',
			'\hugozalm\gpxviewer\migrations\install_gpx_attachment_group',
		];
	}

	public function effectively_installed()
	{
		return (bool) $this->gpx_bbcode_id();
	}

	public function update_data()
	{
		return [
			['custom', [[$this, 'add_gpx_bbcode']]],
		];
	}

	public function revert_data()
	{
		return [
			['custom', [[$this, 'remove_gpx_bbcode']]],
		];
	}

	public function add_gpx_bbcode($last_result = null)
	{
		if ($this->gpx_bbcode_id())
		{
			return true;
		}

		$sql_ary = [
			'bbcode_id'				=> $this->next_bbcode_id(),
			'bbcode_tag'			=> 'gpx',
			'bbcode_match'			=> '[gpx={NUMBER} map-height={UINT1;optional} profile-height={UINT2;optional}]',
			'bbcode_tpl'			=> '<gpx-viewer data-attach="{NUMBER}" map-height="{UINT1}" profile-height="{UINT2}"></gpx-viewer>',
			'bbcode_helpline'		=> '',
			'display_on_posting'	=> 0,
			'first_pass_match'		=> '/(?!)/',
			'first_pass_replace'	=> '',
			'second_pass_match'		=> '/(?!)/',
			'second_pass_replace'	=> '',
		];

		$this->db->sql_query('INSERT INTO ' . BBCODES_TABLE . ' ' . $this->db->sql_build_array('INSERT', $sql_ary));
		$this->invalidate_bbcode_caches();

		return true;
	}

	public function remove_gpx_bbcode($last_result = null)
	{
		$sql = 'DELETE FROM ' . BBCODES_TABLE . "
			WHERE LOWER(bbcode_tag) = 'gpx'";
		$this->db->sql_query($sql);
		$this->invalidate_bbcode_caches();

		return true;
	}

	protected function gpx_bbcode_id()
	{
		$sql = 'SELECT bbcode_id
			FROM ' . BBCODES_TABLE . "
			WHERE LOWER(bbcode_tag) = 'gpx'";
		$result = $this->db->sql_query_limit($sql, 1);
		$row = $this->db->sql_fetchrow($result);
		$this->db->sql_freeresult($result);

		return $row ? (int) $row['bbcode_id'] : 0;
	}

	protected function next_bbcode_id()
	{
		$sql = 'SELECT MAX(bbcode_id) AS max_bbcode_id
			FROM ' . BBCODES_TABLE;
		$result = $this->db->sql_query($sql);
		$row = $this->db->sql_fetchrow($result);
		$this->db->sql_freeresult($result);

		$bbcode_id = ($row && $row['max_bbcode_id']) ? (int) $row['max_bbcode_id'] + 1 : 0;

		// Make sure it is greater than the core bbcode ids, like the ACP does
		if ($bbcode_id <= NUM_CORE_BBCODES)
		{
			$bbcode_id = NUM_CORE_BBCODES + 1;
		}

		return $bbcode_id;
	}

	protected function invalidate_bbcode_caches()
	{
		$this->container->get('cache')->destroy('sql', BBCODES_TABLE);
		$this->container->get('text_formatter.cache')->invalidate();
	}
}
