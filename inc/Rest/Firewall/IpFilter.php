<?php namespace cmk\blank\Rest\Firewall;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Core\CoreOptions;
use cmk\blank\Rest\Firewall\FirewallOptions;

class IpFilter {


	private static function get_client_ip(): string {
		$headers = array(
			'HTTP_CF_CONNECTING_IP',// Cloudflare.
			'HTTP_X_FORWARDED_FOR',
			'HTTP_X_REAL_IP',
			'REMOTE_ADDR',
		);

		foreach ( $headers as $header ) {
			if ( ! empty( $_SERVER[ $header ] ) ) {
				$ip = sanitize_text_field( wp_unslash( $_SERVER[ $header ] ) );
				// X-Forwarded-For can contain multiple IPs, take the first.
				if ( strpos( $ip, ',' ) !== false ) {
					$ip = trim( explode( ',', $ip )[0] );
				}
				if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
					return $ip;
				}
			}
		}

		return '0.0.0.0';
	}

}