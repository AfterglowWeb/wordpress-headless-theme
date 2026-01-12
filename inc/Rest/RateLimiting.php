<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;

class RateLimit {

	public static function check( \WP_REST_Request $request, int $limit = 60 ) {

		$user_id = get_current_user_id();
		$key     = 'blank_rl_' . md5( $user_id . $request->get_route() );

		$count = (int) get_transient( $key );

		if ( $count >= $limit ) {
			return new \WP_Error(
				'blank_rate_limited',
				'Too many requests.',
				array( 'status' => 429 )
			);
		}

		set_transient( $key, $count + 1, MINUTE_IN_SECONDS );

		return true;
	}
}
