<?php namespace cmk\blank\Application;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Admin\Options;

final class WebhookClient {

	public static function post( string $route, array $payload ): array {

		$options = Options::read_options();
		$host    = rtrim( $options['application_host'], '/' );
		$route   = ltrim( $route, '/' );
		$secret  = get_option('blank_theme_application_webhook_secret');

		if ( ! $host || ! $secret ) {
			return new \WP_Error( 'config', 'Webhook not configured' );
		}

		$timestamp = time();
		$body      = ! empty( $payload ) ? wp_json_encode( $payload ) : array();

		$signature = hash_hmac(
			'sha256',
			$body . $timestamp,
			$secret
		);

		return wp_remote_post(
			$host . '/' . $route,
			array(
				'timeout' => 10,
				'headers' => array(
					'Content-Type'        => 'application/json',
					'X-Webhook-Signature' => $signature,
					'X-Webhook-Timestamp' => $timestamp,
					'X-Webhook-Source'    => 'wordpress',
				),
				'body'    => $body,
			)
		);
	}
}
