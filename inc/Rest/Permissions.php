<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Admin\Options;

class Permissions {

	public static function sync_rest_api_user( int $new_user_id, int $old_user_id = 0 ): void {
		if (
			! empty( $old_user_id )
			&& absint( $old_user_id ) !== absint( $new_user_id )
		) {
			self::remove_cap_from_user( absint( $old_user_id ) );
		}

		if ( empty( $new_user_id ) ) {
			return;
		}

		$user = get_user_by( 'id', absint( $new_user_id ) );
		if ( ! $user ) {
			return;
		}

		$user->add_cap( 'blank_api_access' );
	}

	public static function remove_cap_from_user( int $user_id ): void {
		$user = get_user_by( 'id', $user_id );
		if ( $user ) {
			$user->remove_cap( 'blank_api_access' );
		}
	}

	public static function validate_rest_api_token(): bool {
		return is_user_logged_in()
			&& current_user_can( 'blank_api_access' );
	}

	public static function is_post_type_allowed( string $post_type ): bool {

		if ( is_user_logged_in() ) {
			return true;
		}

		if ( ! post_type_exists( $post_type ) ) {
			return false;
		}

		$admin_options            = Options::read_options();
		$blank_allowed_post_types = (array) $admin_options['blank_allowed_post_types'];

		if ( ! in_array( $post_type, $blank_allowed_post_types, true ) ) {
			return false;
		}

		return true;
	}

	public static function protect_wp_rest_routes( $result ) {

		if ( $result instanceof \WP_Error ) {
			return $result;
		}

		if ( is_admin() ) {
			return $result;
		}

		$options = Options::read_options();

		if ( empty( $options['blank_protect_wp_rest_routes'] ) ) {
			return $result;
		}

		if ( empty( $_SERVER['REQUEST_URI'] ) ) {
			return $result;
		}

		$uri = wp_parse_url( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), PHP_URL_PATH );

		if ( ! is_string( $uri ) ) {
			return $result;
		}

		if ( strpos( $uri, '/wp-json/wp/v2/' ) === false ) {
			return $result;
		}

		$auth = self::validate_rest_api_token();
		if ( is_wp_error( $auth ) ) {
			return $auth;
		}

		return true;
	}

	public static function filter_wp_rest_post_types( $result, $server, \WP_REST_Request $request ) {

		if ( $result instanceof \WP_Error ) {
			return $result;
		}

		if ( is_admin() ) {
			return $result;
		}

		$route = $request->get_route();

		$options = Options::read_options();

		if ( empty( $options['blank_protect_wp_rest_routes'] ) ) {
			return $result;
		}

		if ( ! str_starts_with( $route, '/wp/v2/' ) ) {
			return $result;
		}

		$parts     = explode( '/', trim( $route, '/' ) );
		$post_type = $parts[2] ?? null;

		if ( ! $post_type ) {
			return $result;
		}

		if ( false === self::is_post_type_allowed( $post_type ) ) {
			return new \WP_Error(
				'forbidden_post_type',
				__( 'This post type is not allowed.', 'blank' ),
				[ 'status' => 403 ]
			);
		}

		return $result;
	}
}
