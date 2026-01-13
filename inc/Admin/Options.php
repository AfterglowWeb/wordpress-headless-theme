<?php
namespace cmk\blank\Admin;

defined( 'ABSPATH' ) || exit;

class Options {
	protected static $instance = null;

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {
	}

	public static function options_config(): array {
		return array(
			'blank_protect_wp_rest_routes'         => array(
				'default_value'     => false,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
			),

			'blank_allowed_post_types'             => array(
				'default_value'     => array( 'post', 'page' ),
				'type'              => 'array',
				'sanitize_callback' => 'sanitize_key',
			),

			'blank_disable_gutenberg'              => array(
				'default_value'     => false,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
			),

			'blank_disable_comments'               => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
			),

			'blank_enable_acf_support'             => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
			),

			'rest_api_user_id'                     => array(
				'default_value'     => 1,
				'type'              => 'int',
				'sanitize_callback' => 'sanitize_text_field',
			),

			'rest_api_rate_limit'                  => array(
				'default_value'     => 30,
				'type'              => 'int',
				'sanitize_callback' => 'sanitize_text_field',
			),

			'rest_api_rate_limit_time'             => array(
				'default_value'     => 60,
				'type'              => 'int',
				'sanitize_callback' => 'sanitize_text_field',
			),

			'application_host'                     => array(
				'default_value'     => '',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),

			'application_webhook_endpoint'         => array(
				'default_value'     => '',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),

			'application_webhook_secret_generated' => array(
				'default_value'     => false,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
			),

			'max_upload_size'                      => array(
				'default_value'     => 1024, // KB.
				'type'              => 'int',
				'sanitize_callback' => 'sanitize_text_field',
			),

			'enable_max_upload_size'               => array(
				'default_value'     => false,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
			),
		);
	}

	public static function default_options(): array {
		$defaults = array();

		foreach ( self::options_config() as $key => $config ) {
			$defaults[ $key ] = $config['default_value'];
		}

		return $defaults;
	}

	public static function hook_filters(): array {
		$filtered = array();

		foreach ( self::read_options() as $key => $value ) {
			$filtered[ $key ] = apply_filters( 'blank_theme_' . $key, $value );
		}

		return self::sanitize_options( $filtered );
	}

	public static function sanitize_options( array $options ): array {
		$field_config   = self::options_config();
		$default_values = self::default_options();

		$options = wp_parse_args( $options, $default_values );

		$sanitized = array();

		foreach ( $field_config as $key => $config ) {
			$value         = $options[ $key ];
			$sanitized_key = sanitize_key( $key );

			switch ( $config['type'] ) {
				case 'bool':
					$sanitized[ $sanitized_key ] = (bool) call_user_func( $config['sanitize_callback'], $value );
					break;

				case 'int':
					$sanitized[ $sanitized_key ] = (int) call_user_func( $config['sanitize_callback'], $value );
					break;

				case 'array':
					$sanitized[ $sanitized_key ] = array_map(
						$config['sanitize_callback'],
						(array) $value
					);
					break;

				case 'string':
				default:
					$sanitized[ $sanitized_key ] = (string) call_user_func( $config['sanitize_callback'], $value );
					break;
			}
		}

		return $sanitized;
	}

	public static function read_options(): array {
		return self::sanitize_options( get_option( 'blank_theme_options', array() ) );
	}

	public static function update_options( array $new_options ): array {

		$old_options       = self::read_options();
		$sanitized_options = self::sanitize_options( $new_options );

		update_option( 'blank_theme_options', $sanitized_options );

		do_action( 'blank_admin_options_updated', $sanitized_options, $old_options );

		return $sanitized_options;
	}
}
