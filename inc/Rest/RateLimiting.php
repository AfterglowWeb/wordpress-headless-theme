<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Admin\Options;

class RateLimit {

	public static function check( \WP_REST_Request $request, int $limit = 60 ) {

		$user_id       = get_current_user_id();
		$key           = 'blank_rl_' . md5( $user_id . $request->get_route() );
		$admin_options = Options::read_options();
		$rate_limit    = (int) $admin_options['rest_api_rate_limit'];
		$time_limit    = (int) $admin_options['rest_api_rate_limit_time'];

		$count = (int) get_transient( $key );

		if ( $count >= $rate_limit ) {
			return new \WP_Error(
				'blank_rate_limited',
				'Too many requests.',
				array( 'status' => 429 )
			);
		}

		set_transient( $key, $count + 1, $time_limit );

		return true;
	}
}
