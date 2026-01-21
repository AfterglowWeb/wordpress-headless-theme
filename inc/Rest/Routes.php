<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Rest\Permissions;
use cmk\blank\Rest\Controllers\PostController;
use cmk\blank\Rest\Controllers\SiteDataController;
use cmk\blank\Rest\Controllers\AttachmentController;
use cmk\blank\Admin\Options;

class Routes {

	public static function register() {

		self::set_posts_per_page();

		add_filter(
			'rest_authentication_errors',
			array( Permissions::class, 'protect_wp_rest_route' ),
			10,
			3
		);

		add_filter(
			'rest_pre_dispatch',
			array( Permissions::class, 'filter_wp_rest_post_types' ),
			10,
			3
		);

		add_action(
			'rest_api_init',
			function () {
				register_rest_route(
					'blank/v1',
					'/data',
					array(
						'methods'             => 'GET',
						'callback'            => array( SiteDataController::class, 'site_data' ),
						'permission_callback' => array( Permissions::class, 'permission_check' ),
					)
				);

				register_rest_route(
					'blank/v1',
					'/(?P<post_type>[a-zA-Z0-9_-]{2,20})',
					array(
						'methods'             => 'GET',
						'callback'            => array( PostController::class, 'posts_per_post_type' ),
						'permission_callback' => array( Permissions::class, 'permission_check' ),
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
						'callback'            => array( AttachmentController::class, 'attachments_per_post_type' ),
						'permission_callback' => array( Permissions::class, 'permission_check' ),
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


	public static function set_posts_per_page(): void {

		$allowed_post_types = Options::read_option( 'rest_api_allowed_post_types' );

		if ( empty( $allowed_post_types ) ) { // Bail early if not post types are enforced.
			return;
		}

		foreach ( $allowed_post_types as $allowed_post_type ) {

			add_filter(
				'rest_' . $allowed_post_type . '_collection_params',
				function ( $query_params ) {

					$posts_per_page = Options::read_option( 'rest_api_posts_per_page' );

					if ( ! empty( $posts_per_page ) && isset( $query_params['per_page'] ) ) {
						$query_params['per_page']['default'] = $posts_per_page;
						$query_params['per_page']['maximum'] = $posts_per_page;
					}
					return $query_params;
				},
				10,
				2
			);

		}
	}
}
