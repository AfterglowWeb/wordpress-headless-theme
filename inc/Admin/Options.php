<?php
namespace cmk\blank\Admin;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Rest\Permissions;

class Options {
	protected static $instance = null;

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	public static function options_config(): array {
		return array(

			// Models
			'blank_use_core_rest_enabled'             => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'blank_relative_url_enabled'              => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'blank_embed_featured_attachment_enabled' => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'blank_embed_post_attachments_enabled'    => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'blank_relative_attachment_url_enabled'   => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'blank_embed_terms_enabled'               => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'blank_embed_authors_enabled'             => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'blank_with_acf_enabled'                  => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			// Enforce preset on collections.

			'rest_api_posts_per_page'                 => array(
				'default_value'     => 100,
				'type'              => 'int',
				'sanitize_callback' => 'absint',
				'rest_expose'       => false,
			),

			'rest_api_attachments_per_page'           => array(
				'default_value'     => 100,
				'type'              => 'int',
				'sanitize_callback' => 'absint',
				'rest_expose'       => false,
			),

			// Permissions.

			'rest_api_restrict_post_types_enabled'    => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'rest_api_allowed_post_types'             => array(
				'default_value'     => array( 'post', 'page' ),
				'type'              => 'array',
				'sanitize_callback' => 'sanitize_key',
				'rest_expose'       => false,
			),

			'rest_api_protect_wp_rest_routes'         => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'rest_api_user_id'                        => array(
				'default_value'     => 1,
				'type'              => 'int',
				'sanitize_callback' => 'absint',
				'rest_expose'       => false,
			),

			'rest_api_rate_limit'                     => array(
				'default_value'     => 30,
				'type'              => 'int',
				'sanitize_callback' => 'absint',
				'rest_expose'       => false,
			),

			'rest_api_rate_limit_time'                => array(
				'default_value'     => 60,
				'type'              => 'int',
				'sanitize_callback' => 'absint',
				'rest_expose'       => false,
			),

			// Application.

			'application_host'                        => array(
				'default_value'     => '',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'rest_expose'       => false,
			),

			'application_webhook_endpoint'            => array(
				'default_value'     => '',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'rest_expose'       => false,
			),

			// Core.

			'core_disable_gutenberg_enabled'          => array(
				'default_value'     => false,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'core_disable_comments_enabled'           => array(
				'default_value'     => true,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

			'core_max_upload_size'                    => array(
				'default_value'     => 1024, // KB.
				'type'              => 'int',
				'sanitize_callback' => 'absint',
				'rest_expose'       => false,
			),

			'core_max_upload_size_enabled'            => array(
				'default_value'     => false,
				'type'              => 'bool',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'rest_expose'       => false,
			),

		);
	}

	public function register_settings(): void {
		register_setting(
			'blank_theme_options_group',
			'blank_theme_options',
			array(
				'sanitize_callback' => array( self::class, 'sanitize_options' ),
				'default'           => self::default_options(),
				'show_in_rest'      => self::show_in_rest() ? self::rest_schema() : false,
			)
		);

		add_action(
			'blank_admin_option_updated',
			function ( string $key, $new, $old ) {

				if ( 'rest_api_user_id' === $key ) {
					Permissions::sync_rest_api_user( $new, $old );
				}
			},
			10,
			3
		);
	}

	public static function show_in_rest(): bool {
		return (bool) apply_filters(
			'blank_show_admin_options_in_rest',
			false
		);
	}

	public static function rest_schema(): array {
		$schema = array(
			'type'       => 'object',
			'properties' => array(),
		);

		foreach ( self::options_config() as $key => $config ) {
			if ( empty( $config['rest_expose'] ) ) {
				continue;
			}

			switch ( $config['type'] ) {
				case 'bool':
					$type = 'boolean';
					break;

				case 'int':
					$type = 'integer';
					break;

				case 'array':
					$type = 'array';
					break;

				default:
					$type = 'string';
					break;
			}

			$schema['properties'][ $key ] = array(
				'type' => $type,
			);
		}

		return array( 'schema' => $schema );
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

		foreach ( self::read_options() as $option_key => $value ) {
			$filtered[ $option_key ] = self::sanitize_option( $option_key, apply_filters( 'blank_theme_' . $option_key, $value ) );
		}

		return $filtered;
	}

	public static function sanitize_options( array $options ): array {
		$options_config = self::options_config();
		$default_values = self::default_options();

		$options   = wp_parse_args( $options, $default_values );
		$sanitized = array();

		foreach ( $options_config as $option_key => $config ) {
			$sanitized_key = sanitize_key( $option_key );
			$value         = $options[ $option_key ];

			$sanitized[ $sanitized_key ] = self::sanitize_option( $option_key, $value );
		}

		return $sanitized;
	}

	public static function sanitize_option( string $option_key, $option_value ) {
		$options_config = self::options_config();

		if ( ! isset( $options_config[ $option_key ] ) ) {
			return null;
		}

		$config   = $options_config[ $option_key ];
		$callback = $config['sanitize_callback'] ?? null;
		$type     = $config['type'] ?? 'string';

		if ( ! is_callable( $callback ) ) {
			return $config['default_value'] ? $config['default_value'] : null;

		}

		switch ( $type ) {
			case 'bool':
				return (bool) call_user_func( $callback, $option_value );

			case 'int':
				return (int) call_user_func( $callback, $option_value );

			case 'array':
				return is_array( $option_value )
					? array_map( $callback, $option_value )
					: array();

			case 'string':
			default:
				return (string) call_user_func( $callback, $option_value );
		}
	}

	public static function read_options(): array {
		return self::sanitize_options( self::multisite_get_option( 'blank_theme_options', array() ) );
	}

	public static function read_option( string $option_key ) {
		$options = self::sanitize_options( self::multisite_get_option( 'blank_theme_options', array() ) );
		return isset( $options[ $option_key ] ) ? $options[ $option_key ] : false;
	}

	public static function update_options( array $new_options ): array {

		$old_options       = self::read_options();
		$sanitized_options = self::sanitize_options( $new_options );

		self::multisite_update_option( 'blank_theme_options', $sanitized_options );

		do_action( 'blank_admin_options_updated', $sanitized_options, $old_options );

		return $sanitized_options;
	}

	public static function update_option( string $option_key, $new_option ) {

		$old_option = self::read_option( $option_key );
		if ( false === $old_option ) {
			return false;
		}

		$sanitized_option       = self::sanitize_option( $option_key, $new_option );
		$options                = self::read_options();
		$options[ $option_key ] = $sanitized_option;
		self::multisite_update_option( 'blank_theme_options', $options );

		do_action( 'blank_admin_option_updated', $option_key, $sanitized_option, $old_option );

		return $sanitized_option;
	}

	public static function is_multisite_mode(): bool {
		return is_multisite()
			&& apply_filters( 'blank_use_multisite_options', false );
	}

	public static function multisite_get_option( string $option, $default = array() ): array {
		if ( self::is_multisite_mode() ) {
			return get_site_option( $option, $default );
		}

		return get_option( $option, $default );
	}

	public static function multisite_update_option( string $option, $value ): bool {
		if ( self::is_multisite_mode() ) {
			return update_site_option( $option, $value );
		}

		return update_option( $option, $value );
	}
}
