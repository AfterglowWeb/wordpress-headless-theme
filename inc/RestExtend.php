<?php namespace cmk\blank;

defined( 'ABSPATH' ) || exit;

class RestExtend {

	protected static $instance = null;

	public static function get_instance(): restExtend {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {

		add_action(
			'rest_api_init',
			function (): void {

				register_rest_route(
					'blank/v1',
					'/data',
					array(
						'methods'             => 'GET',
						'callback'            => 'cmk\blank\RestExtend::fetch_data',
						'permission_callback' => 'cmk\blank\RestExtend::validate_bearer_token'
					)
				);

			}
		);
	}

	public static function validate_bearer_token( \WP_REST_Request $request ): bool {
		$auth_header = $request->get_header( 'Authorization' );
		
		if ( empty( $auth_header ) ) {
			return false;
		}

		$token_parts = explode( '|', $auth_header );
		if ( count( $token_parts ) !== 2 || $token_parts[0] !== 'Bearer' ) {
			return false;
		}

		$received_token = $token_parts[1];

		/**
		 * Filter the user ID for Bearer token validation.
		 * By default, validates against User ID 1.
		 *
		 * @param int $user_id The user ID to validate the token against.
		 * @return int Modified user ID.
		 */
		$user_id = (int) sanitize_text_field( apply_filters( 'blank_rest_api_user_id', 1 ) );

		$passwords = \WP_Application_Passwords::get_user_application_passwords( $user_id );

		if ( empty( $passwords ) || ! is_array( $passwords ) ) {
			return false;
		}

		foreach ( $passwords as $password_data ) {
			if ( ! isset( $password_data['password'] ) ) {
				continue;
			}
			
			if ( \WP_Application_Passwords::check_password( $received_token, $password_data['password'] ) ) {
				return true;
			}
		}

		return false;
	}

	public static function fetch_data(): \WP_REST_Response {

		$data = array(
			'menus'     => self::create_rest_menus(),
			'identity'  => self::create_rest_site_identity(),
		);

		if ( empty( $data ) ) {
			return new \WP_REST_Response(
				array(
					'status'  => 'error',
					'message' => 'No data available',
				),
				404
			);
		}

		$response = new \WP_REST_Response( $data, 200 );

		add_action(
			'rest_pre_serve_request',
			function () {
				header_remove( 'Cache-Control' );
				header_remove( 'Expires' );
				header_remove( 'Pragma' );
			},
			5
		);

		$response->header( 'Cache-Control', 'no-cache, must-revalidate, max-age=0' );
		$response->header( 'Expires', gmdate( 'D, d M Y H:i:s', time() - 1800 ) . ' GMT' );
		$response->header( 'Pragma', 'no-cache' );

		return $response;
	}

	private static function create_rest_site_identity(): array {

		$default_options = array(
			'name'        => (string) sanitize_text_field( get_bloginfo( 'name' ) ),
			'description' => (string) sanitize_text_field( get_bloginfo( 'description' ) ),
			'url'         => (string) esc_url( get_bloginfo( 'url' ) ),
			'favicon'     => (string) get_site_icon_url() ? esc_url( get_site_icon_url() ) : '',
		);

		$fields = array();
		
		// Optional: Populate with ACF options page fields if ACF is active.
		if ( function_exists( 'get_fields' ) ) {
			$fields = get_fields( 'options' );
		}
	
		$identity_data = array_merge(
			$default_options,
			$fields
		);

		/**
		 * Filter the site identity data before returning to REST API.
		 *
		 * @param array $identity_data The site identity data array.
		 * @return array Modified identity data.
		 */
		return apply_filters( 'blank_rest_site_identity', $identity_data );
	}

	private static function create_rest_menus(): array {
		$locations = get_nav_menu_locations();
		if ( empty( $locations ) ) {
			return array();
		}

		$flattened_menus = array();

		foreach ( $locations as $location => $menu_id ) {
			$flattened_menu = self::flatten_menu( $menu_id );
			if ( empty( $flattened_menu ) ) {
				continue;
			}
			$location                     = str_replace( '-', '_', $location );
			$flattened_menus[ $location ] = $flattened_menu;
		}

		if ( empty( $flattened_menus ) ) {
			return array();
		}

		/**
		 * Filter the menus data before returning to REST API.
		 *
		 * @param array $flattened_menus The hierarchical menus array.
		 * @return array Modified menus data.
		 */
		return apply_filters( 'blank_rest_menus', $flattened_menus );
	}

	private static function flatten_menu( $menu_id ): array {
		$menu_id = (int) $menu_id;
		if ( empty( $menu_id ) ) {
			return array();
		}

		$menu    = wp_get_nav_menu_items( $menu_id );
		$post_id = (int) get_the_ID() ? get_the_ID() : sanitize_text_field( wp_unslash( $_GET['post'] ?? 0 ) );

		if ( ! is_array( $menu ) || empty( $menu ) ) {
			return array();
		}

		$menu_map = array();
		foreach ( $menu as $index => $item ) {
			$menu_map[ $item->ID ] = array(
				'id'          => (int) $item->ID,
				'title'       => (string) sanitize_text_field( $item->title ),
				'url'         => (string) esc_url( $item->url ),
				'object_id'   => (int) $item->object_id,
				'object_slug' => (string) sanitize_key( $item->object_slug ),
				'type'        => (string) sanitize_key( $item->type ),
				'parent'      => (int) $item->menu_item_parent,
				'children'    => array(),
				'classes'     => (array) $item->classes,
				'target'      => (string) $item->target,
				'attr_title'  => (string) $item->attr_title,
				'is_active'   => (int) intVal( $item->object_id ) === $post_id ? 1 : 0,
			);
		}

		$hierarchical_menu = array();
		foreach ( $menu_map as $id => $item ) {
			if ( ! empty( $item['parent'] ) && isset( $menu_map[ $item['parent'] ] ) ) {
				$menu_map[ $item['parent'] ]['children'][] = &$menu_map[ $id ];
			} else {
				$hierarchical_menu[] = &$menu_map[ $id ];
			}
		}

		return $hierarchical_menu;
	}

}
