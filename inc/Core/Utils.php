<?php
namespace cmk\blank\Core;

defined( 'ABSPATH' ) || exit;

class Utils {

	public static function list_users(): array {

		$users      = get_users(['role__in' => [ 'administrator' ]]);

		$users_array = array_map(
			static function ( \WP_User $user ): array {
				$user_id = (int) $user->ID;
				return [
					'value'        => $user_id,
					'label'        => sanitize_text_field( $user->display_name ?? '' ),
					'admin_url'    => sanitize_url( get_edit_user_link( $user_id ) ),
					'current_user' => get_current_user_id() === $user_id ? 1 : 0,
				];
			},
			array_filter(
				(array) $users,
				static fn ( $user ) => $user instanceof \WP_User
			)
		);

		return $users_array;
	}

	public static function list_post_types() {

		$post_types = get_post_types(
			[
				'public'       => true,
				'show_in_rest' => true,
			],
			'objects'
		);


		if ( empty( $post_types ) ) {
			return;
		}

		$post_types_list = array_map(
			static fn ( object $post_type ) => [
					'value' => sanitize_key( $post_type->name),
					'label' => property_exists( $post_type->labels, 'singular_name') ?
					sanitize_text_field( $post_type->labels->singular_name ) : 
					sanitize_key( $post_type->name ),
			],
			$post_types
		);

		return array_values( $post_types_list );
	}

	public static function list_taxonomies() {

		$taxonomies = get_taxonomies(
			[
				'public'       => true,
				'show_in_rest' => true,
			],
			'objects'
		);
		if ( empty( $taxonomies ) ) {
			return;
		}

		$taxonomies = array_map(
			static fn ( object $taxonomy ) => [
				'value' => sanitize_key( $taxonomy->name ),
				'label' => property_exists( $taxonomy->labels, 'singular_name') ? 
					sanitize_text_field( $taxonomy->labels->singular_name ) : 
					sanitize_key( $taxonomy->name ),
			], $taxonomies );

		return array_values( $taxonomies );
	}
}
