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
						'callback'            => 'cmk\blank\RestExtend::site_data',
						'permission_callback' => 'cmk\blank\RestExtend::validate_bearer_token',
					)
				);
			}
		);

		add_action(
			'rest_api_init',
			function (): void {
				register_rest_route(
					'blank/v1',
					'/(?P<post_type>[a-zA-Z0-9_-]{2,20})/images',
					array(
						'methods'             => 'GET',
						'callback'            => 'cmk\blank\RestExtend::images_per_post_type',
						'permission_callback' => 'cmk\blank\RestExtend::validate_bearer_token',
						'args'                => array(
							'post_type' => array(
								'required'          => true,
								'type'              => 'string',
								'sanitize_callback' => 'sanitize_text_field',
							),
						),
					)
				);
			}
		);

		add_action(
			'rest_api_init',
			function (): void {
				register_rest_route(
					'blank/v1',
					'/(?P<post_type>[a-zA-Z0-9_-]{2,20})',
					array(
						'methods'             => 'GET',
						'callback'            => 'cmk\blank\RestExtend::posts_per_post_type',
						'permission_callback' => 'cmk\blank\RestExtend::validate_bearer_token',
						'args'                => array(
							'post_type' => array(
								'required'          => true,
								'type'              => 'string',
								'sanitize_callback' => 'sanitize_text_field',
							),
						),
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
		if ( 2 !== count( $token_parts ) || 'Bearer' !== $token_parts[0] ) {
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
		$user_id = (int) sanitize_text_field( apply_filters( 'blank_rest_api_user_id', 1, 10, 1 ) );

		/**
		 * Filter the application password name for Bearer token validation.
		 * By default, uses 'rest_api' as the password name.
		 *
		 * @param string $password_name The application password name.
		 * @return string Modified password name.
		 */
		$password_name = (string) sanitize_text_field( apply_filters( 'blank_rest_api_password_key', 'rest_api', 10, 1 ) );


		return Utils::validate_application_password( $received_token, $user_id, $password_name );
	}

	public static function site_data(): \WP_REST_Response {

		$data = self::site_data_flat();

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

	public static function images_per_post_type( \WP_REST_Request $request ): \WP_REST_Response {

		$post_type = $request->get_param( 'post_type' );

		if ( ! post_type_exists( $post_type ) ) {
			return new \WP_REST_Response(
				array(
					'status'  => 'error',
					'message' => 'Invalid post type',
				),
				400
			);
		}

		$allowed_post_types = (array) apply_filters( 'blank_allowed_post_types_bulk_images', array( 'portfolio', 'post', 'page' ) );

		if ( ! in_array( $post_type, $allowed_post_types, true ) ) {
			return new \WP_REST_Response(
				array(
					'status'  => 'error',
					'message' => 'Post type not allowed',
				),
				403
			);
		}

		$args   = array(
			'post_type'      => $post_type,
			'posts_per_page' => -1,
			'post_status'    => 'publish',
		);
		$query  = new \WP_Query( $args );
		$images = array();

		foreach ( $query->posts as $post ) {
			$images = array_merge( $images, self::post_images_flat( $post ) );
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

		if ( ! post_type_exists( $post_type ) ) {
			return new \WP_REST_Response(
				array(
					'status'  => 'error',
					'message' => 'Invalid post type',
				),
				400
			);
		}

		$args  = array(
			'post_type'      => $post_type,
			'posts_per_page' => -1,
			'post_status'    => 'publish',
		);
		$query = new \WP_Query( $args );
		$posts = array();

		foreach ( $query->posts as $post ) {
			$posts[] = self::filter_post_props( $post );
		}

		return rest_ensure_response( $posts );
	}

	private static function site_data_flat(): array {

		$default_options = array(
			'name'        => (string) sanitize_text_field( get_bloginfo( 'name' ) ),
			'description' => (string) sanitize_text_field( get_bloginfo( 'description' ) ),
			'url'         => (string) esc_url( get_bloginfo( 'url' ) ),
			'favicon'     => (string) get_site_icon_url() ? esc_url( get_site_icon_url() ) : '',
		);

		$fields = array();

		if ( function_exists( 'get_fields' ) ) {
			$fields = get_fields( 'options' );
		}

		$data = array(
			'menus'    => self::menus_flat(),
			'identity' => array_merge(
				$default_options,
				$fields
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
			$menu_map[ $item->ID ] = self::filter_menu_item_props( $item );
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

	private static function post_image_ids( $post ): array {
		$image_ids = array();

		$thumb_id = get_post_thumbnail_id( $post->ID );
		if ( $thumb_id ) {
			$image_ids[] = $thumb_id;
		}

		if ( function_exists( 'get_fields' ) ) {
			$fields = get_fields( $post->ID );
			foreach ( $fields as $field_key => $value ) {
				if ( is_numeric( $value ) && get_post_mime_type( $value ) ) {
					$image_ids[] = $value;
				} elseif ( is_array( $value ) && ! empty( $value ) ) {
					foreach ( $value as $sub_value ) {
						if ( is_numeric( $sub_value ) && get_post_mime_type( $sub_value ) ) {
							$image_ids[] = $sub_value;
						} elseif ( is_array( $sub_value ) && isset( $sub_value['ID'] ) && get_post_mime_type( $sub_value['ID'] ) ) {
							$image_ids[] = $sub_value['ID'];
						}
					}
				}
			}
		}

		$image_ids = array_filter( $image_ids );

		return $image_ids;
	}

	private static function post_images_flat( $post ): array {
		$images    = array();
		$image_ids = self::post_image_ids( $post );
		foreach ( $image_ids as $index => $image_id ) {
			$field_key = 1 === $index ? 'featured_image' : 'gallery';
			$images[]  = self::filter_image_props( $image_id, $post->ID, $field_key );
		}

		$images = array_filter( $images );
		return $images;
	}

	private static function filter_image_props( $img_id, $post_id = null, $field_key = '' ): array {

		$src = wp_get_attachment_image_url( $img_id, 'full' );
		if ( ! $src ) {
			return null;
		}

		$src   = get_post_meta( $img_id, '_wp_attached_file', true );// The attribute is called 'file' on attachment post, we use it as the relative src.
		$meta  = wp_get_attachment_metadata( $img_id );
		$alt   = get_post_meta( $img_id, '_wp_attachment_image_alt', true );
		$mime  = get_post_mime_type( $img_id );
		$title = get_the_title( $img_id );

		$filtered_image = array(
			'id'        => (int) $img_id,
			'src'       => $src,
			'alt'       => $alt ?: $title,
			'width'     => isset( $meta['width'] ) ? (int) $meta['width'] : null,
			'height'    => isset( $meta['height'] ) ? (int) $meta['height'] : null,
			'mime_type' => $mime,
			'post_id'   => $post_id ? (int) $post_id : null,
			'field_key' => $field_key,
		);

		return (array) apply_filters( 'blank_rest_image', $filtered_image, $img_id );
	}

	private static function filter_term_props( $term ): array {
		$filtered_term = array(
			'id'          => (int) $term->term_id,
			'name'        => (string) sanitize_text_field( $term->name ),
			'slug'        => (string) sanitize_text_field( $term->slug ),
			'description' => (string) sanitize_text_field( $term->description ),
			'count'       => (int) $term->count,
			'acf'         => apply_filters( 'blank_rest_term_acf', function_exists( 'get_fields' ) ? (array) get_fields( $term ) : array(), $term->term_id ),
		);

		return (array) apply_filters( 'blank_rest_term', $filtered_term, $term );
	}

	private static function filter_post_props( $post ): array {
			
			$post_images = self::post_images_flat( $post );

			// Prepare ACF image field keys to exclude from ACF fields.
			$acf_image_keys = $post_images ? array_map(
				function ( $img ) {
					return $img['field_key'];
				},
				$post_images
			) : array();

			// Filter ACF fields to exclude image fields.
			add_filter(
				'blank_rest_post_acf',
				function ( $acf_fields ) use ( $acf_image_keys ) {
					foreach ( $acf_fields as $key => $value ) {
						if ( in_array( $key, $acf_image_keys, true ) ) {
							unset( $acf_fields[ $key ] );
						}
					}
					return $acf_fields;
				},
				10,
				1
			);

			$filtered_post = array(
				'id'       => (int) $post->ID,
				'type'     => (string) sanitize_text_field( $post->post_type ),
				'title'    => (string) sanitize_text_field( $post->post_title ),
				'slug'     => (string) sanitize_text_field( $post->post_name ),
				'date'     => (string) get_the_date( 'c', $post->ID ),
				'modified' => (string) get_the_modified_date( 'c', $post->ID ),
				'link'     => (string) esc_url( get_permalink( $post->ID ) ),
				'content'  => (string) apply_filters( 'the_content', $post->post_content ),
				'excerpt'  => (string) apply_filters( 'the_excerpt', $post->post_excerpt ),
				'terms'    => array_map(
					function ( $taxonomy ) use ( $post ) {
						$terms = get_the_terms( $post->ID, $taxonomy );
						if ( is_wp_error( $terms ) || empty( $terms ) ) {
							return array();
						}
						return array_map( array( self::class, 'filter_term_props' ), $terms );
					},
					get_object_taxonomies( (string) sanitize_text_field( $post->post_type ), 'names' )
				),
				'images'   => $post_images,
				'acf'      => apply_filters( 'blank_rest_post_acf', function_exists( 'get_fields' ) ? (array) get_fields( $post->ID ) : array(), $post->ID ),
			);

			return apply_filters( 'blank_rest_post', $filtered_post, $post );
	}

	private static function filter_menu_item_props( $menu_item ): array {
		$filtered_menu_item = array(
			'id'         => (int) sanitize_text_field( $menu_item->ID ),
			'title'      => (string) sanitize_text_field( $menu_item->title ),
			'url'        => (string) esc_url( $menu_item->url ),
			'type'       => (string) sanitize_key( $menu_item->type ),
			'parent'     => (int) sanitize_text_field( $menu_item->menu_item_parent ),
			'classes'    => (array) $menu_item->classes,
			'target'     => (string) sanitize_text_field( $menu_item->target ),
			'attr_title' => (string) sanitize_text_field( $menu_item->attr_title ),
		);

		return (array) apply_filters( 'blank_rest_menu_item', $filtered_menu_item, $menu_item );
	}
}
