<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;

class Controllers {

	public static function site_data(): \WP_REST_Response {

		$data = self::site_data_flat();

		if ( empty( $data ) ) {
			return new \WP_REST_Response(
				array(
					'status'  => 'error',
					'message' => esc_html__( 'No data available', 'blank' ),
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

	public static function images_per_post_type( \WP_REST_Request $request ): \WP_REST_Response {

		$post_type = $request->get_param( 'post_type' );

		$args   = array(
			'post_type'      => $post_type,
			'posts_per_page' => -1,
			'post_status'    => 'publish',
		);
		$query  = new \WP_Query( $args );
		$images = array();

		foreach ( $query->posts as $post ) {
			$images = array_merge( $images, Models::post_attachments( $post ) );
		}

		$images = array_filter( $images );
		$images = array_values(
			array_reduce(
				$images,
				function ( $carry, $img ) {
					$carry[ $img['id'] ] = $img;
					return $carry;
				},
				array()
			)
		);

		return rest_ensure_response( $images );
	}

	public static function posts_per_post_type( \WP_REST_Request $request ): \WP_REST_Response {

		$post_type = $request->get_param( 'post_type' );

		$args  = array(
			'post_type'      => $post_type,
			'posts_per_page' => -1,
			'post_status'    => 'publish',
		);
		$query = new \WP_Query( $args );
		$posts = array();

		foreach ( $query->posts as $post ) {
			$posts[] = Models::post_model( $post );
		}

		return rest_ensure_response( $posts );
	}

	public static function site_data_flat(): array {

		$default_options = array(
			'name'        => (string) sanitize_text_field( get_bloginfo( 'name' ) ),
			'description' => (string) sanitize_text_field( get_bloginfo( 'description' ) ),
			'url'         => (string) sanitize_url( get_bloginfo( 'url' ) ),
			'favicon'     => (string) get_site_icon_url() ? sanitize_url( get_site_icon_url() ) : '',
		);

		$data = array(
			'menus'    => self::menus_flat(),
			'identity' => array_merge(
				$default_options,
				apply_filters( 'blank_rest_site_data_acf', 'options' )
			),
		);

		/**
		 * Filter the site identity data before returning to REST API.
		 *
		 * @param array $options_data The site identity data array.
		 * @return array Modified identity data.
		 */
		$filtered_options_data = (array) apply_filters( 'blank_rest_site_data', $data );

		return $filtered_options_data;
	}

	private static function menus_flat(): array {
		$locations = get_nav_menu_locations();
		if ( empty( $locations ) ) {
			return array();
		}

		$flattened_menus = array();

		foreach ( $locations as $location => $menu_id ) {
			$flattened_menu = self::menu_flat( $menu_id );
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

	private static function menu_flat( $menu_id ): array {
		$menu_id = (int) $menu_id;
		if ( empty( $menu_id ) ) {
			return array();
		}

		$menu = wp_get_nav_menu_items( $menu_id );

		if ( ! is_array( $menu ) || empty( $menu ) ) {
			return array();
		}

		$menu_map = array();
		foreach ( $menu as $item ) {
			$menu_map[ $item->ID ] = Models::menu_item_model( $item );
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
