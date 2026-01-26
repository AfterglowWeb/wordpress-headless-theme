<?php namespace cmk\blank\Core;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Core\CoreOptions;

class Acf {

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	protected static $instance = null;

	private function __construct() {

		if ( ! function_exists( 'get_fields' ) ) {
			return;
		}

		if ( true === CoreOptions::read_option( 'blank_sync_acf_fields_to_json_enabled' ) ) {
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
		}

		if (true === CoreOptions::read_option( 'blank_with_acf_enabled' ) ) {
			add_filter( 'blank_rest_post_acf', array( self::class, 'get_acf_fields' ), 10, 1 );
			add_filter( 'blank_rest_term_acf', array( self::class, 'get_acf_fields' ), 10, 1 );
			add_filter( 'blank_rest_menu_item_acf', array( self::class, 'get_acf_fields' ), 10, 1 );
			add_filter( 'blank_rest_image_acf', array( self::class, 'get_acf_fields' ), 10, 1 );
			add_filter( 'blank_rest_site_data_acf', array( self::class, 'get_acf_fields' ), 10, 1 );
		}

		
	}

	public static function get_acf_fields( int $object_id ): array {
		return function_exists( 'get_fields' ) ? (array) get_fields( $object_id ) : array();
	}
}
