<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;

use \cmk\blank\Rest\Permissions;
use \cmk\blank\Rest\RateLimit;
use \cmk\blank\Rest\Controllers;
use \cmk\blank\Admin\Options;

class Routes {


	public static function register() {


		add_filter(
			'rest_authentication_errors',
			function ( $result ) {

				if ( is_wp_error( $result ) ) {
					return $result;
				}

				$option = Options::read_option( 'blank_protect_wp_rest_routes' );
				if ( empty( $option ) ) {
					return $result;
				}

				if ( false === Permissions::validate_rest_api_token() ) {
					return new \WP_Error(
						'rest_forbidden',
						__( 'Authentication required.' ),
						[ 'status' => 401 ]
					);
				}

				return $result;
			}, 10,
			3
		);

		add_filter(
			'rest_pre_dispatch',
			array( \cmk\blank\Rest\Permissions::class, 'filter_wp_rest_post_types' ),
			10,
			3
		);

		add_action(
			'rest_api_init',
			function () {

				self::set_posts_per_page();

				register_rest_route(
					'blank/v1',
					'/data',
					array(
						'methods'             => 'GET',
						'callback'            => array( Controllers::class, 'site_data' ),
						'permission_callback' => array( Routes::class, 'permission_check' ),
					)
				);

				register_rest_route(
					'blank/v1',
					'/(?P<post_type>[a-zA-Z0-9_-]{2,20})',
					array(
						'methods'             => 'GET',
						'callback'            => array( Controllers::class, 'posts_per_post_type' ),
						'permission_callback' => array( Routes::class, 'permission_check' ),
						'args'                => array(
							'post_type' => array(
								'required'          => true,
								'sanitize_callback' => 'sanitize_key',
								'validate_callback' => array( Permissions::class, 'is_post_type_allowed' ),
							),
						),
					)
				);

				register_rest_route(
					'blank/v1',
					'/(?P<post_type>[a-zA-Z0-9_-]{2,20})/images',
					array(
						'methods'             => 'GET',
						'callback'            => array( Controllers::class, 'attachments_per_post_type' ),
						'permission_callback' => array( Routes::class, 'permission_check' ),
						'args'                => array(
							'post_type' => array(
								'required'          => true,
								'sanitize_callback' => 'sanitize_key',
								'validate_callback' => array( Permissions::class, 'is_post_type_allowed' ),
							),
						),
					)
				);
			}
		);
	}

	public static function permission_check( \WP_REST_Request $request ) {
		$auth = Permissions::validate_rest_api_token();
		if ( is_wp_error( $auth ) ) {
			return $auth;
		}

		$rate = RateLimit::check( $request );
		if ( is_wp_error( $rate ) ) {
			return $rate;
		}

		return true;
	}

	public static function set_posts_per_page(): void {
		$admin_options      = Options::read_options();
		$allowed_post_types = $admin_options['blank_allowed_post_types'];

		foreach ( $allowed_post_types as $allowed_post_type ) {
			add_filter(
				'rest_' . $allowed_post_type . '_collection_params',
				function ( $query_params ) {
					$admin_options = Options::read_options();
					$max_per_page  = $admin_options['rest_api_posts_per_page'];

					if ( isset( $query_params['per_page'] ) ) {
						$query_params['per_page']['default'] = $max_per_page;
						$query_params['per_page']['maximum'] = $max_per_page;
					}
					return $query_params;
				},
				10,
				2
			);
		}
	}
}
