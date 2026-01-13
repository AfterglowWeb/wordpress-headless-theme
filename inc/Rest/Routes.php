<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Admin\Options;

class Routes {

	public static function register() {

		add_action(
			'init',
			function (): void {
				$admin_options      = Options::read_options();
				$allowed_post_types = $admin_options['blank_allowed_post_types'];

				foreach ( $allowed_post_types as $allowed_post_type ) {
					add_filter(
						"rest_{$allowed_post_type}_collection_params",
						function ( $query_params ) {
							$max_per_page = (int) sanitize_text_field( apply_filters( 'blank_rest_api_max_per_page', 1000 ) );

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
			},
			10
		);

		add_filter(
			'rest_pre_dispatch',
			function ( $result, $server, $request ) {
				if ( strpos( $request->get_route(), '/settings' ) === false ) {
					return $result;
				}

				$auth = \cmk\blank\Rest\Permissions::validate_rest_api_token();
				if ( is_wp_error( $auth ) ) {
					return $auth;
				}

				$rate = \cmk\blank\Rest\RateLimit::check( $request );
				if ( is_wp_error( $rate ) ) {
					return $rate;
				}

				return $result;
			},
			10,
			3
		);

		add_filter(
			'rest_authentication_errors',
			function ( $result ) {

				if ( ! is_user_logged_in() ) {
					return $result;
				}

				if ( ! current_user_can( 'blank_api_access' ) && ! is_admin() ) {
					return new \WP_Error(
						'rest_forbidden',
						'REST API access denied.',
						array( 'status' => 403 )
					);
				}

				return $result;
			}
		);

		add_action(
			'rest_api_init',
			function () {

				register_rest_route(
					'blank/v1',
					'/data',
					array(
						'methods'             => 'GET',
						'callback'            => array( Controllers::class, 'site_data' ),
						'permission_callback' => function ( \WP_REST_Request $request ) {
							$auth = \cmk\blank\Rest\Permissions::validate_rest_api_token();
							if ( is_wp_error( $auth ) ) {
								return $auth;
							}

							$rate = \cmk\blank\Rest\RateLimit::check( $request );
							if ( is_wp_error( $rate ) ) {
								return $rate;
							}

							return true;
						},
					)
				);

				register_rest_route(
					'blank/v1',
					'/(?P<post_type>[a-zA-Z0-9_-]{2,20})',
					array(
						'methods'             => 'GET',
						'callback'            => array( Controllers::class, 'posts_per_post_type' ),
						'permission_callback' => function ( \WP_REST_Request $request ) {

							$auth = \cmk\blank\Rest\Permissions::validate_rest_api_token();
							if ( is_wp_error( $auth ) ) {
								return $auth;
							}

							$rate = \cmk\blank\Rest\RateLimit::check( $request );
							if ( is_wp_error( $rate ) ) {
								return $rate;
							}

							return true;
						},

						'args'                => array(
							'post_type' => array(
								'required'          => true,
								'sanitize_callback' => 'sanitize_key',
								'validate_callback' => function ( $param ) {
									if ( false === \cmk\blank\Rest\Permissions::is_post_type_allowed( $param ) ) {
										return new \WP_Error(
											'forbidden_post_type',
											__( 'This post type is not allowed.', 'blank' ),
											array( 'status' => 403 )
										);
									}
									return true;
								},
							),
						),
					)
				);

				register_rest_route(
					'blank/v1',
					'/(?P<post_type>[a-zA-Z0-9_-]{2,20})/images',
					array(
						'methods'             => 'GET',
						'callback'            => array( Controllers::class, 'images_per_post_type' ),
						'permission_callback' => function ( $request ) {
							$auth = \cmk\blank\Rest\Permissions::validate_rest_api_token();
							if ( is_wp_error( $auth ) ) {
								return $auth;
							}

							$rate = \cmk\blank\Rest\RateLimit::check( $request );
							if ( is_wp_error( $rate ) ) {
								return $rate;
							}

							return true;
						},
						'args'                => array(
							'post_type' => array(
								'required'          => true,
								'sanitize_callback' => 'sanitize_key',
								'validate_callback' => function ( $param ) {
									if ( false === \cmk\blank\Rest\Permissions::is_post_type_allowed( $param ) ) {
										return new \WP_Error(
											'forbidden_post_type',
											__( 'This post type is not allowed.', 'blank' ),
											array( 'status' => 403 )
										);
									}
									return true;
								},
							),
						),
					)
				);
			}
		);
	}
}
