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

class install_gpx_attachment_group extends \phpbb\db\migration\migration
{
	public function effectively_installed()
	{
		$sql = 'SELECT group_id
			FROM ' . $this->table_prefix . 'extension_groups
			WHERE group_name = \'' . $this->db->sql_escape('GPX') . '\'';
		$result = $this->db->sql_query($sql);
		$installed = (bool) $this->db->sql_fetchrow($result);
		$this->db->sql_freeresult($result);

		return $installed;
	}

	public static function depends_on()
	{
		return ['\phpbb\db\migration\data\v320\v320'];
	}

	public function update_data()
	{
		return [
			['custom', [[$this, 'add_gpx_extension_group']]],
		];
	}

	public function revert_data()
	{
		return [
			['custom', [[$this, 'remove_gpx_extension_group']]],
		];
	}

	public function add_gpx_extension_group($last_result = null)
	{
		$sql = 'SELECT group_id
			FROM ' . $this->table_prefix . 'extension_groups
			WHERE group_name = \'' . $this->db->sql_escape('GPX') . '\'';
		$result = $this->db->sql_query($sql);
		$exists = (bool) $this->db->sql_fetchrow($result);
		$this->db->sql_freeresult($result);

		if ($exists)
		{
			return true;
		}

		$sql_ary = [
			'group_name'		=> 'GPX',
			'cat_id'			=> ATTACHMENT_CATEGORY_NONE,
			'allow_group'		=> 1,
			'download_mode'		=> INLINE_LINK,
			'upload_icon'		=> '',
			'max_filesize'		=> 0,
			'allowed_forums'	=> '',
			'allow_in_pm'		=> 0,
		];

		$this->db->sql_query('INSERT INTO ' . $this->table_prefix . 'extension_groups ' . $this->db->sql_build_array('INSERT', $sql_ary));
		$group_id = (int) $this->db->sql_nextid();

		$sql_ary = [
			'group_id'		=> $group_id,
			'extension'		=> 'gpx',
		];

		$this->db->sql_query('INSERT INTO ' . $this->table_prefix . 'extensions ' . $this->db->sql_build_array('INSERT', $sql_ary));

		return true;
	}

	public function remove_gpx_extension_group($last_result = null)
	{
		$sql = 'DELETE FROM ' . $this->table_prefix . 'extensions
			WHERE extension = \'' . $this->db->sql_escape('gpx') . '\'';
		$this->db->sql_query($sql);

		$sql = 'DELETE FROM ' . $this->table_prefix . 'extension_groups
			WHERE group_name = \'' . $this->db->sql_escape('GPX') . '\'';
		$this->db->sql_query($sql);

		return true;
	}
}
