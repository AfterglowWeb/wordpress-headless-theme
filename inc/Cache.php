<?php namespace cmk\blank;

defined( 'ABSPATH' ) || exit;

class Cache {

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	protected static $instance = null;

	private function __construct() {

	}


}
