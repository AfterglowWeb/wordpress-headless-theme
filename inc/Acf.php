<?php namespace cmk\blank;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Admin\Options;

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

		$admin_options = Options::read_options();
		if ( false === $admin_options['blank_enable_acf_support'] ) {
			return;
		}

		add_filter(
			'acf/settings/save_json',
			function () {
				return get_stylesheet_directory() . '/config';
			}
		);
		add_filter(
			'acf/settings/load_json',
			function () {
				return get_stylesheet_directory() . '/config';
			}
		);
		add_filter( 'blank_rest_post_acf', array( $this, 'get_acf_fields' ), 10, 1 );
		add_filter( 'blank_rest_term_acf', array( $this, 'get_acf_fields' ), 10, 1 );
		add_filter( 'blank_rest_menu_item_acf', array( $this, 'get_acf_fields' ), 10, 1 );
		add_filter( 'blank_rest_image_acf', array( $this, 'get_acf_fields' ), 10, 1 );
		add_filter( 'blank_rest_site_data_acf', array( $this, 'get_acf_fields' ), 10, 1 );
	}

	public function get_acf_fields( $object_id ): array {
		return function_exists( 'get_fields' ) ? (array) get_fields( $object_id ) : array();
	}
}
