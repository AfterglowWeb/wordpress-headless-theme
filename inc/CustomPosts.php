<?php namespace cmk\blank;

defined( 'ABSPATH' ) || exit;

class CustomPosts {

	protected static $instance = null;

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {
		add_action( 'init', array( $this, 'register_custom_posts' ) );
		add_action( 'init', array( $this, 'register_custom_taxonomies' ) );
		add_action( 'use_block_editor_for_post_type', array( $this, 'disable_gutenberg' ), 10, 2 );
		add_action( 'init', array( $this, 'disable_tags' ) );

		
		$this->add_admin_column(
			'Image',
			array( 'portfolio' ),
			function ( $post_id ) {
				$thumbnail_id = get_post_thumbnail_id( $post_id );
				if ( $thumbnail_id ) {
					$thumbnail = wp_get_attachment_image( $thumbnail_id, array( 50, 50 ), false, array( 'style' => 'box-shadow: 0 0px 3px rgba(0,0,0,0.1); border-radius: 0;' ) );
					echo wp_kses_post( $thumbnail );
				} else {
					echo '<span style="color: #999;">Aucune image</span>';
				}
			}
		);

	}

	public function disable_tags(): void {
		unregister_taxonomy_for_object_type( 'post_tag', 'post' );
	}

	public function register_custom_posts(): void {
		try {
			$json_file = get_stylesheet_directory() . '/config/custom_posts.json';
			if ( ! file_exists( $json_file ) ) {
				new \WP_Error( 'Custom posts configuration file not found' );
			}

			$json_content = file_get_contents( $json_file );
			$custom_posts = json_decode( $json_content, true );

			if ( ! isset( $custom_posts['custom_posts'] ) ) {
				new \WP_Error( 'Invalid custom posts configuration' );
			}

			foreach ( $custom_posts['custom_posts'] as $post_type ) {

				$required_fields = array( 'name', 'singular_name', 'slug' );
				foreach ( $required_fields as $field ) {
					if ( ! isset( $post_type[ $field ] ) ) {
						new \WP_Error( "Missing required field: {$field} for {$post_type['name']}" );
					}
				}

				$name          = esc_html__( $post_type['name'], 'blank' );
				$singular_name = esc_html__( $post_type['singular_name'], 'blank' );

				$labels = array(
					'name'               => esc_html__( $name ),
					'singular_name'      => esc_html__( $singular_name ),
					'menu_name'          => esc_html__( $name ),
					/* translators: %s is a singular name */
					'add_new'            => sprintf( esc_html__( 'Add %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'add_new_item'       => sprintf( esc_html__( 'Add New %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'edit_item'          => sprintf( esc_html__( 'Edit %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'new_item'           => sprintf( esc_html__( 'New %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'view_item'          => sprintf( esc_html__( 'View %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a plural name */
					'search_items'       => sprintf( esc_html__( 'Search %s', 'blank' ), strtolower( $name ) ),
					/* translators: %s is a singular name */
					'not_found'          => sprintf( esc_html__( 'No %s found', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'not_found_in_trash' => sprintf( esc_html__( 'No %s found in trash', 'blank' ), strtolower( $singular_name ) ),
				);

				$args = array(
					'labels'             => $labels,
					'public'             => $post_type['public'] ?? true,
					'publicly_queryable' => $post_type['publicly_queryable'] ?? true,
					'show_ui'            => $post_type['show_ui'] ?? true,
					'show_in_menu'       => $post_type['show_in_menu'] ?? true,
					'show_in_rest'       => $post_type['show_in_rest'] ?? true,
					'query_var'          => $post_type['query_var'] ?? true,
					'rewrite'            => isset( $post_type['rewrite'] ) ?
						array(
							'slug'       => $post_type['rewrite'],
							'with_front' => false,
						) :
						array(
							'slug' => $post_type['slug'],
						),
					'capability_type'    => $post_type['capability_type'] ?? 'post',
					'has_archive'        => $post_type['has_archive'] ?? false,
					'hierarchical'       => $post_type['hierarchical'] ?? false,
					'menu_position'      => $post_type['menu_position'] ?? null,
					'menu_icon'          => $post_type['menu_icon'] ?? 'dashicons-admin-post',
					'supports'           => $post_type['supports'] ?? array( 'title', 'editor' ),
					'taxonomies'         => $post_type['taxonomies'] ?? array(),
				);

				register_post_type( $post_type['slug'], $args );
			}
		} catch ( \Exception $e ) {
			new \WP_Error( 'Custom Post Types Registration Error: ' . $e->getMessage() );
		}
	}

	public function register_custom_taxonomies(): void {
		try {
			$json_file = get_stylesheet_directory() . '/config/custom_taxonomies.json';
			if ( ! file_exists( $json_file ) ) {
				new \WP_Error( 'Custom taxonomies configuration file not found' );
			}

			$json_content      = file_get_contents( $json_file );
			$custom_taxonomies = json_decode( $json_content, true );

			if ( ! isset( $custom_taxonomies['taxonomies'] ) ) {
				new \WP_Error( 'Invalid taxonomies configuration' );
			}

			if ( empty( $custom_taxonomies['taxonomies'] ) ) {
				new \WP_Error( 'Empty custom taxonomies' );
			}

			foreach ( $custom_taxonomies['taxonomies'] as $taxonomy ) {

				$required_fields = array( 'name', 'singular_name', 'slug', 'post_types' );
				foreach ( $required_fields as $field ) {
					if ( ! isset( $taxonomy[ $field ] ) ) {
						new \WP_Error( "Missing required field: {$field}" );
					}
				}

				$name          = esc_html__( $taxonomy['name'], 'blank' );
				$singular_name = esc_html__( $taxonomy['singular_name'], 'blank' );

				$labels = array(
					'name'              => esc_html__( $name ),
					'singular_name'     => esc_html__( $singular_name ),
					'menu_name'         => esc_html__( $name ),
					/* translators: %s is a singular name */
					'parent_item'       => sprintf( esc_html__( 'Parent %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'parent_item_colon' => sprintf( esc_html__( 'Parent %s:', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'update_item'       => sprintf( esc_html__( 'Update %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'add_new'           => sprintf( esc_html__( 'Add New %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'add_new_item'      => sprintf( esc_html__( 'Add New %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'new_item'          => sprintf( esc_html__( 'New %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'edit_item'         => sprintf( esc_html__( 'Edit %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a singular name */
					'view_item'         => sprintf( esc_html__( 'View %s', 'blank' ), strtolower( $singular_name ) ),
					/* translators: %s is a plural name */
					'all_items'         => sprintf( esc_html__( '%s list', 'blank' ), strtolower( $name ) ),
					/* translators: %s is a plural name */
					'search_items'      => sprintf( esc_html__( 'Search %s', 'blank' ), strtolower( $name ) ),
				);

				$args = array(
					'labels'            => $labels,
					'hierarchical'      => $taxonomy['hierarchical'] ?? false,
					'public'            => $taxonomy['public'] ?? true,
					'show_ui'           => $taxonomy['show_ui'] ?? true,
					'show_admin_column' => $taxonomy['show_admin_column'] ?? true,
					'show_in_nav_menus' => $taxonomy['show_in_nav_menus'] ?? true,
					'show_tagcloud'     => $taxonomy['show_tagcloud'] ?? true,
					'show_in_rest'      => $taxonomy['show_in_rest'] ?? true,
					'query_var'         => $taxonomy['query_var'] ?? true,
					'rewrite'           => $taxonomy['rewrite'] ?? array( 'slug' => $taxonomy['slug'] ),
				);

				register_taxonomy(
					$taxonomy['slug'],
					$taxonomy['post_types'],
					$args
				);
			}
		} catch ( \Exception $e ) {
			new \WP_Error( 'Custom Taxonomies Registration Error: ' . $e->getMessage() );
		}
	}

	public function add_admin_column(
		$column_title,
		$post_types,
		$callback,
		$order_by = false,
		$order_by_field_is_meta = false,
		$meta_type = 'meta_value'
	): void {

		if ( ! is_array( $post_types ) ) {
			$post_types = array( $post_types );
		}

		foreach ( $post_types as $post_type ) {

			add_filter(
				'manage_' . $post_type . '_posts_columns',
				function ( $columns ) use ( $column_title ) {
					$columns[ sanitize_title( $column_title ) ] = $column_title;
					return $columns;
				}
			);

			add_action(
				'manage_' . $post_type . '_posts_custom_column',
				function ( $column, $post_id ) use ( $column_title, $callback ) {
					if ( sanitize_title( $column_title ) === $column ) {
						$callback( $post_id );
					}
				},
				10,
				2
			);

			if ( true === empty( $order_by ) ) {
				continue;
			}

			add_filter(
				'manage_edit-' . $post_type . '_sortable_columns',
				function ( $columns ) use ( $column_title, $order_by ) {
					$columns[ sanitize_title( $column_title ) ] = $order_by;
					return $columns;
				}
			);

			add_action(
				'pre_get_posts',
				function ( $query ) use ( $order_by, $order_by_field_is_meta, $meta_type ) {
					if ( false === is_admin() || false === $query->is_main_query() ) {
						return;
					}

					if ( sanitize_key( $order_by ) === $query->get( 'orderby' ) ) {
						if ( $order_by_field_is_meta ) {
							$query->set( 'orderby', $meta_type );
							$query->set( 'meta_key', sanitize_key( $order_by_field_is_meta ) );
						} else {
							$query->set( 'orderby', sanitize_key( $order_by ) );
						}
					}
				}
			);

		}
	}

	public function disable_gutenberg( $current_status, $post_type ) {
		if ( in_array($post_type, array('portfolio', 'page', 'post'), true ) ) {
			return false;
		}

		return $current_status;
	}

}
