<?php namespace cmk\blank;

defined( 'ABSPATH' ) || exit;

class Acf {

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	protected static $instance = null;

	private function __construct() {

		if ( ! class_exists( 'ACF' ) ) {
			return;
		}

		add_filter( 'acf/settings/save_json', array( $this, 'json_save_fields' ) );
		add_filter( 'acf/settings/load_json', array( $this, 'json_load_fields' ) );
	}

	public function json_save_fields( $path ): string {
		$path = get_stylesheet_directory() . '/config';
		return $path;
	}

	public function json_load_fields( $paths ): array {
		$paths[] = get_stylesheet_directory() . '/config';
		return $paths;
	}
}
