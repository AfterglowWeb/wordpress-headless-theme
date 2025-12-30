<?php namespace cmk\blank;

defined( 'ABSPATH' ) || exit;

class Utils {

	protected static $instance = null;

	public static function get_instance(): restExtend {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {
	}

	public static function validate_application_password( $received_token, $user_id, $password_name ): bool {
		
		$password = self::get_application_password( $user_id, $password_name);

		if ( empty( $password ) ) {
			return false;
		}

		if ( \WP_Application_Passwords::check_password( $received_token, $password ) ) {
			return true;
		}

		return false;
	}

	public static function get_application_password( $user_id, $password_name) {
		$passwords = \WP_Application_Passwords::get_user_application_passwords( $user_id );

		if ( empty( $passwords ) || ! is_array( $passwords ) ) {
			return '';
		}

		$password_data = array_filter(
			$passwords,
			function ( $password_data ) use ( $password_name ) {
				return isset( $password_data['name'] ) && $password_data['name'] === $password_name;
			}
		);

		if ( ! isset( $password_data['password'] ) ) {
			return '';
		}

		return  $password_data['password'];
	}

}
