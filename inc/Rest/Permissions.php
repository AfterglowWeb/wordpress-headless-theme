<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Admin\Options;

/**
 *  Options::read_option( 'rest_api_protect_wp_rest_routes' );
 *  Options::read_option( 'rest_api_allowed_post_types' )
 *  Options::read_option( 'rest_api_restrict_post_types_enabled' )
 */

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
		if ( false === $user instanceof \WP_User ) {
			return;
		}

		$user->add_cap( 'blank_api_access' );
	}

	private static function remove_cap_from_user( int $user_id ): void {
		$user = get_user_by( 'id', $user_id );
		if ( $user instanceof \WP_User ) {
			$user->remove_cap( 'blank_api_access' );
		}
	}

	private static function validate_rest_api_token(): bool {
		return (bool) is_user_logged_in()
			&& current_user_can( 'blank_api_access' );
	}

	public static function permission_check( \WP_REST_Request $request ) {

		if ( false === self::validate_rest_api_token() ) {
			return false;
		}

		$rate = RateLimit::check( $request );
		if ( is_wp_error( $rate ) ) {
			return $rate;
		}

		return true;
	}

	public static function protect_wp_rest_route( $result ) {

		if ( is_wp_error( $result ) ) {
			return $result;
		}

			$option = Options::read_option( 'rest_api_protect_wp_rest_routes' );
		if ( empty( $option ) ) {
			return $result;
		}

		if ( false === self::validate_rest_api_token() ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'Authentication required.' ),
				array( 'status' => 401 )
			);
		}

			return $result;
	}

	public static function is_post_type_allowed( string $post_type ): bool {

		if ( ! post_type_exists( $post_type ) ) {
			return false;
		}

		$allowed_post_types = Options::read_option( 'rest_api_allowed_post_types' );

		if ( empty( $allowed_post_types ) ) { // If option is not set, all posts are allowed
			return true;
		}

		if ( ! in_array( $post_type, $allowed_post_types, true ) ) {
			return false;
		}

		return true;
	}

	public static function filter_wp_rest_post_types( $result, $server, \WP_REST_Request $request ) {

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( false === Options::read_option( 'rest_api_restrict_post_types_enabled' ) ) {
			return $result;
		}

		$parts     = explode( '/', trim( $request->get_route(), '/' ) );
		$post_type = isset( $parts[2] ) ? sanitize_key( $parts[2] ) : null;

		if ( ! $post_type ) {
			return $result;
		}

		if ( false === self::is_post_type_allowed( $post_type ) ) {
			return new \WP_Error(
				'forbidden_post_type',
				__( 'This post type is not allowed.', 'blank' ),
				array( 'status' => 403 )
			);
		}

		return $result;
	}
}
