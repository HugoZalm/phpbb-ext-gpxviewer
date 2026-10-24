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

class update_gpx_bbcode_max_zoom extends \phpbb\db\migration\container_aware_migration
{
	const GPX_BBCODE_MATCH = '[gpx={NUMBER} map-height={UINT1;optional} profile-height={UINT2;optional} max-zoom={UINT3;optional}]';
	const GPX_BBCODE_TPL = '<gpx-viewer data-attach="{NUMBER}" map-height="{UINT1}" profile-height="{UINT2}" max-zoom="{UINT3}"></gpx-viewer>';

	const GPX_BBCODE_MATCH_PREVIOUS = '[gpx={NUMBER} map-height={UINT1;optional} profile-height={UINT2;optional}]';
	const GPX_BBCODE_TPL_PREVIOUS = '<gpx-viewer data-attach="{NUMBER}" map-height="{UINT1}" profile-height="{UINT2}"></gpx-viewer>';

	public static function depends_on()
	{
		return [
			'\hugozalm\gpxviewer\migrations\update_gpx_bbcode',
		];
	}

	public function effectively_installed()
	{
		return (bool) strpos($this->gpx_bbcode_match(), 'max-zoom');
	}

	public function update_data()
	{
		return [
			['custom', [[$this, 'upgrade_gpx_bbcode']]],
		];
	}

	public function revert_data()
	{
		return [
			['custom', [[$this, 'restore_gpx_bbcode']]],
		];
	}

	public function upgrade_gpx_bbcode($last_result = null)
	{
		$this->set_gpx_bbcode(self::GPX_BBCODE_MATCH, self::GPX_BBCODE_TPL);

		return true;
	}

	public function restore_gpx_bbcode($last_result = null)
	{
		$this->set_gpx_bbcode(self::GPX_BBCODE_MATCH_PREVIOUS, self::GPX_BBCODE_TPL_PREVIOUS);

		return true;
	}

	protected function set_gpx_bbcode($match, $tpl)
	{
		$sql = 'UPDATE ' . BBCODES_TABLE . '
			SET ' . $this->db->sql_build_array('UPDATE', [
				'bbcode_match'	=> $match,
				'bbcode_tpl'	=> $tpl,
			]) . "
			WHERE LOWER(bbcode_tag) = 'gpx'";
		$this->db->sql_query($sql);

		$this->invalidate_bbcode_caches();

		return true;
	}

	protected function gpx_bbcode_match()
	{
		$sql = 'SELECT bbcode_match
			FROM ' . BBCODES_TABLE . "
			WHERE LOWER(bbcode_tag) = 'gpx'";
		$result = $this->db->sql_query_limit($sql, 1);
		$row = $this->db->sql_fetchrow($result);
		$this->db->sql_freeresult($result);

		return $row ? (string) $row['bbcode_match'] : '';
	}

	protected function invalidate_bbcode_caches()
	{
		$this->container->get('cache')->destroy('sql', BBCODES_TABLE);
		$this->container->get('text_formatter.cache')->invalidate();
	}
}
