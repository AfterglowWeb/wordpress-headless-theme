<?php namespace cmk\blank;

defined( 'ABSPATH' ) || exit;
/*
@version 1.0.1
@changelog log
- Added filter on menu items 'blank_rest_menu_item' to allow modification of individual menu items before returning in REST API.
- Added endpoint '/images/{post_type}' to fetch flattened list of images used in specified post type.
- Changed filter name from 'cmk_blank_allowed_post_types' to 'blank_allowed_post_types_bulk_images' for consistency.
- Added filter 'blank_rest_image_props' to allow modification of image properties before returning in REST API.
*/
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


		add_action(
			'rest_api_init', 
			function (): void  {
			register_rest_route('blank/v1', '/images/(?P<post_type>[a-zA-Z0-9_-]{2,20})', [
				'methods'  => 'GET',
				'callback' => 'cmk\blank\RestExtend::images_flat',
				'permission_callback' => 'cmk\blank\RestExtend::validate_bearer_token',
				'args'     => [
					'post_type' => [
						'required' => true,
						'type'     => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
				],
			]);
		});


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
			'menus'     => self::menus_flat(),
			'identity'  => self::site_identity(),
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

	private static function site_identity(): array {

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
			
			// Remove duplicate contact fields from root level
			$contact_fields = array(
				'adresse',
				'zip',
				'city',
				'region',
				'country',
				'phone',
				'phone_link',
				'email',
				'facebook',
				'latitude',
				'longitude',
				'gmap_apikey',
			);
			
			foreach ( $contact_fields as $field ) {
				if ( isset( $fields[ $field ] ) && isset( $fields['contact'][ $field ] ) ) {
					unset( $fields[ $field ] );
				}
			}
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
		$filtered_identity_data = (array) apply_filters( 'blank_rest_site_identity', $identity_data );

		return $filtered_identity_data;
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

		$menu    = wp_get_nav_menu_items( $menu_id );

		if ( ! is_array( $menu ) || empty( $menu ) ) {
			return array();
		}

		$menu_map = array();
		foreach ( $menu as $item ) {
			$menu_map[ $item->ID ] = array(
				'id'          => (int) sanitize_text_field( $item->ID ),
				'title'       => (string) sanitize_text_field( $item->title ),
				'url'         => (string) esc_url( $item->url ),
				'type'        => (string) sanitize_key( $item->type ),
				'parent'      => (int) sanitize_text_field( $item->menu_item_parent ),
				'classes'     => (array) $item->classes,
				'target'      => (string) sanitize_text_field( $item->target ),
				'attr_title'  => (string) sanitize_text_field( $item->attr_title ),
			);

			$menu_map[ $item->ID ] = apply_filters( 'blank_rest_menu_item', $menu_map[ $item->ID ], $item );
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

	public static function images_flat(\WP_REST_Request $request): \WP_REST_Response {
	
		$post_type = $request->get_param('post_type');

		if(!post_type_exists($post_type)) {
			return new \WP_REST_Response(
				array(
					'status'  => 'error',
					'message' => 'Invalid post type',
				),
				400
			);
		}

		$allowed_post_types = (array) apply_filters('blank_allowed_post_types_bulk_images', ['portfolio', 'post', 'page']);

		if(!in_array($post_type, $allowed_post_types, true)) {
			return new \WP_REST_Response(
				array(
					'status'  => 'error',
					'message' => 'Post type not allowed',
				),
				403
			);
		}

		$args = [
			'post_type'      => $post_type,
			'posts_per_page' => -1,
			'post_status'    => 'publish',
		];
		$query = new \WP_Query($args);
		$images = [];

		foreach ($query->posts as $post) {
			$thumb_id = get_post_thumbnail_id($post->ID);
			if ($thumb_id) {
				$images[] = self::filter_image_props($thumb_id);
			}

			if (function_exists('get_fields')) {
				$fields = get_fields($post->ID);
				foreach ($fields as $key => $value) {
					if (is_numeric($value) && get_post_mime_type($value)) {
						$images[] = self::filter_image_props($value);
					} elseif (is_array($value) && isset($value['ID']) && is_numeric($value['ID']) && get_post_mime_type($value['ID'])) {
						$images[] = self::filter_image_props($value['ID']);
					}

					if (is_array($value)) {
						foreach ($value as $index => $img_id) {
							if (is_numeric($img_id) && get_post_mime_type($img_id)) {
								$images[] = self::filter_image_props($img_id);
							} elseif (is_array($value) && isset($value['ID']) && is_numeric($value['ID']) && get_post_mime_type($value['ID'])) {
								$images[] = self::filter_image_props($value['ID']);
							}
						}
					}
				}
			}
		}

		$images = array_filter($images);
		$images = array_values(array_reduce($images, function($carry, $img) {
			$carry[$img['id']] = $img;
			return $carry;
		}, []));

		return rest_ensure_response($images);
	}

private static function filter_image_props($img_id) {
    
	$src = wp_get_attachment_image_url($img_id, 'full');
    if (!$src) return null;
	
	$relative_src = wp_make_link_relative($src);
	$relative_src = str_replace('/wp-content/uploads/', '', $relative_src);
    $meta = wp_get_attachment_metadata($img_id);
    $alt = get_post_meta($img_id, '_wp_attachment_image_alt', true);
    $mime = get_post_mime_type($img_id);
    $title = get_the_title($img_id);

    $filtered_image = [
        'id'        => (int)$img_id,
        'src'       => $relative_src,
        'alt'       => $alt ?: $title,
        'width'     => isset($meta['width']) ? (int)$meta['width'] : null,
        'height'    => isset($meta['height']) ? (int)$meta['height'] : null,
        'mime_type' => $mime,
    ];

	return (array) apply_filters('blank_rest_image_props', $filtered_image, $img_id);
}

}
