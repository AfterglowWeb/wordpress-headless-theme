<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Acf;

class Models {

	public static function post_model( $post ): array {

			$filtered_post = array(
				'id'       => (int) $post->ID,
				'type'     => (string) sanitize_text_field( $post->post_type ),
				'title'    => (string) sanitize_text_field( $post->post_title ),
				'slug'     => (string) sanitize_text_field( $post->post_name ),
				'date'     => (string) get_the_date( 'c', $post->ID ),
				'modified' => (string) get_the_modified_date( 'c', $post->ID ),
				'link'     => (string) sanitize_url( get_permalink( $post->ID ) ),
				'content'  => (string) apply_filters( 'the_content', $post->post_content ),
				'excerpt'  => (string) apply_filters( 'the_excerpt', $post->post_excerpt ),
				'terms'    => array_map(
					function ( $taxonomy ) use ( $post ) {
						$terms = get_the_terms( $post->ID, $taxonomy );
						if ( is_wp_error( $terms ) || empty( $terms ) ) {
							return array();
						}
						return array_map( array( self::class, 'term_model' ), $terms );
					},
					get_object_taxonomies( (string) sanitize_text_field( $post->post_type ), 'names' )
				),
				'images'   => self::post_attachments( $post ),
				'acf'      => apply_filters( 'blank_rest_post_acf', $post->ID ),
			);

			return apply_filters( 'blank_rest_post', $filtered_post, $post );
	}

	public static function attachment_model( $img_id, $post_id = null, $field_key = '' ): array {

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
			'id'        => $img_id,
			'src'       => $src,
			'alt'       => $alt ? $alt : $title,
			'width'     => isset( $meta['width'] ) ? absint( $meta['width'] ) : null,
			'height'    => isset( $meta['height'] ) ? absint( $meta['height'] ) : null,
			'mime_type' => $mime,
            'filesize'  => isset( $meta['filesize'] ) ? absint( $meta['filesize'] ) : null,
            'length'    => isset( $meta['length'] ) ? absint( $meta['length'] ) : null,
			'parent_id' => $post_id ? absint( $post_id ) : null,
			'field_key' => $field_key,
			'acf'       => apply_filters( 'blank_rest_image_acf', $img_id ),
		);

		return (array) apply_filters( 'blank_rest_image', $filtered_image, $img_id );
	}

	public static function post_attachments( $post ): array {
		
		$images    = array();
		$image_ids = array();

		$thumb_id = get_post_thumbnail_id( $post->ID );
		if ( $thumb_id ) {
			$image_ids[] = $thumb_id;
		}

		$image_ids = array_merge( $image_ids, Acf::get_acf_image_ids( $post->ID) );

		foreach ( $image_ids as $index => $image_id ) {
			$field_key = 1 === $index ? 'featured_image' : 'gallery';
			$images[]  = self::attachment_model( $image_id, $post->ID, $field_key );
		}

		$images = array_filter( $images );
		return $images;
	}

	public static function term_model( $term ): array {
		$filtered_term = array(
			'id'          => (int) $term->term_id,
			'name'        => (string) sanitize_text_field( $term->name ),
			'slug'        => (string) sanitize_text_field( $term->slug ),
			'description' => (string) sanitize_text_field( $term->description ),
			'count'       => (int) $term->count,
			'acf'         => apply_filters( 'blank_rest_term_acf', $term ),
		);

		return (array) apply_filters( 'blank_rest_term', $filtered_term, $term );
	}

	public static function menu_item_model( $menu_item ): array {
		$filtered_menu_item = array(
			'id'         => (int) sanitize_text_field( $menu_item->ID ),
			'title'      => (string) sanitize_text_field( $menu_item->title ),
			'url'        => (string) sanitize_url( $menu_item->url ),
			'type'       => (string) sanitize_key( $menu_item->type ),
			'parent'     => (int) sanitize_text_field( $menu_item->menu_item_parent ),
			'classes'    => (array) $menu_item->classes,
			'target'     => (string) sanitize_text_field( $menu_item->target ),
			'attr_title' => (string) sanitize_text_field( $menu_item->attr_title ),
			'acf'        => apply_filters( 'blank_rest_menu_item_acf', $menu_item->ID ),

		);

		return (array) apply_filters( 'blank_rest_menu_item', $filtered_menu_item, $menu_item );
	}
}
