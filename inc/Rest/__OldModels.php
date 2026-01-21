<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Rest\Controllers\AttachmentController;
use WP_Post;
use WP_User;
use WP_Term;

class __OldModels {

	public static function post_model( WP_Post $post ): array {

		if ( false === $post instanceof WP_Post ) {
			return array();
		}

			$sanitized_post = sanitize_post( $post );

			$filtered_post = array(
				'id'             => (int) $sanitized_post->ID,
				'link'           => (string) apply_filters( 'blank_relative_url', sanitize_url( get_permalink( $sanitized_post ) ) ),
				'type'           => (string) $sanitized_post->post_type,
				'title'          => (string) $sanitized_post->post_title,
				'author'         => (array) self::author_model( $post ),
				'featured_media' => (int) self::attachment_model( get_post_thumbnail_id( $sanitized_post ), $sanitized_post->ID, 'featured_media' ),
				'slug'           => (string) $sanitized_post->post_name,
				'date'           => (string) get_the_date( 'c', $sanitized_post ),
				'modified'       => (string) get_the_modified_date( 'c', $sanitized_post ),
				'content'        => (string) apply_filters( 'the_content', $sanitized_post->post_content ),
				'excerpt'        => (string) apply_filters( 'the_excerpt', $sanitized_post->post_excerpt ),
				'terms'          => array_map(
					static function ( string $taxonomy ) use ( $sanitized_post ): array {

						$terms = get_the_terms( $sanitized_post->ID, $taxonomy );

						if ( is_wp_error( $terms ) || empty( $terms ) ) {
							return array();
						}

						return array_map(
							static fn ( WP_Term $term ) => self::term_model( $term ),
							$terms
						);
					},
					get_object_taxonomies(
						$sanitized_post->post_type,
						'names'
					)
				),
				'images'         => AttachmentController::attachments_per_post_flat( $post ),
				'acf'            => apply_filters( 'blank_rest_post_acf', $sanitized_post->ID ),
			);

			return apply_filters( 'blank_rest_post', $filtered_post, $post );
	}

	public static function attachment_model( int $img_id, int $parent_id = null, string $field_key = '' ): array {

		if ( ! $img_id ) {
			return null;
		}

		$img_url = sanitize_url( wp_get_attachment_image_url( $img_id, 'full' ) );

		if ( ! $img_url ) {
			return null;
		}

		$attachment_meta = array_map( 'absint', wp_get_attachment_metadata( $img_id ) );

		$src   = sanitize_text_field( apply_filters( 'blank_relative_attachment_url', $attachment_meta['file'], $img_url ) );
		$alt   = sanitize_text_field( get_post_meta( $img_id, '_wp_attachment_image_alt', true ) );
		$mime  = sanitize_text_field( get_post_mime_type( $img_id ) );
		$title = sanitize_text_field( get_the_title( $img_id ) );

		$filtered_attachment = array(
			'id'        => absint( $img_id ),
			'src'       => $src,
			'alt'       => $alt ? $alt : $title,
			'width'     => isset( $attachment_meta['width'] ) ? $attachment_meta['width'] : null,
			'height'    => isset( $attachment_meta['height'] ) ? $attachment_meta['height'] : null,
			'mime_type' => $mime,
			'filesize'  => isset( $attachment_meta['filesize'] ) ? $attachment_meta['filesize'] : null,
			'length'    => isset( $attachment_meta['length'] ) ? $attachment_meta['length'] : null,
			'parent_id' => $parent_id ? absint( $parent_id ) : null,
			'field_key' => $field_key,
			'acf'       => apply_filters( 'blank_rest_attachment_acf', $img_id ),
		);

		return (array) apply_filters( 'blank_rest_attachment', $filtered_attachment, $img_id );
	}

	public static function author_model( WP_Post $post ): array {

		if ( false === $post instanceof WP_Post ) {
			return array();
		}

		$user = get_user( $post->post_author );
		if ( false === $user instanceof WP_User ) {
			return array();
		}

		return array(
			'nickname'     => $user->get( 'nickname' ),
			'first_name'   => $user->get( 'first_name' ),
			'last_name'    => $user->get( 'last_name' ),
			'display_name' => $user->get( 'display_name' ),
		);
	}

	public static function term_model( WP_Term $term ): array {

		if ( false === $term instanceof WP_Term ) {
			return array();
		}

		$sanitized_term = sanitize_term( $term, $term->taxonomy );

		$filtered_term = array(
			'id'          => (int) $sanitized_term->term_id,
			'link'        => (string) sanitize_text_field( apply_filters( 'blank_relative_url', $sanitized_term ) ),
			'name'        => (string) $sanitized_term->name,
			'slug'        => (string) $sanitized_term->slug,
			'description' => (string) $sanitized_term->description,
			'count'       => (int) $sanitized_term->count,
			'acf'         => apply_filters( 'blank_rest_term_acf', $sanitized_term ),
		);

		return (array) apply_filters( 'blank_rest_term', $filtered_term, $sanitized_term );
	}

	public static function menu_item_model( WP_Post $menu_item ): array {

		if ( false === $menu_item instanceof WP_Post ) {
			return array();
		}

		$sanitized_menu_item = sanitize_post( $menu_item );

		$filtered_menu_item = array(
			'id'          => (int) $sanitized_menu_item->ID,
			'title'       => (string) $sanitized_menu_item->title,
			'description' => (string) $sanitized_menu_item->description,
			'url'         => (string) apply_filters( 'blank_relative_url', $sanitized_menu_item->url ),
			'type'        => (string) $sanitized_menu_item->type,
			'parent'      => (int) $sanitized_menu_item->menu_item_parent,
			'classes'     => (array) $menu_item->classes,
			'target'      => (string) $sanitized_menu_item->target,
			'attr_title'  => (string) $sanitized_menu_item->attr_title,
			'acf'         => (array) apply_filters( 'blank_rest_menu_item_acf', $menu_item->ID ),
		);

		return (array) apply_filters( 'blank_rest_menu_item', $filtered_menu_item, $sanitized_menu_item );
	}
}
