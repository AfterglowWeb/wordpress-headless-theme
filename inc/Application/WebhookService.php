<?php namespace cmk\blank\Application;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Admin\Permissions;
use cmk\blank\Admin\Options;

class WebhookService {

	protected static $instance = null;

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'wp_ajax_trigger_application_webhook', array( $this, 'ajax_trigger_application_webhook' ) );
		add_action( 'wp_ajax_has_application_webhook_secret', array( $this, 'ajax_has_application_webhook_secret' ) );
		add_action( 'wp_ajax_update_application_webhook_secret', array( $this, 'ajax_update_application_webhook_secret' ) );
		add_action( 'wp_ajax_delete_application_webhook_secret', array( $this, 'ajax_delete_application_webhook_secret' ) );
		add_action( 'admin_bar_menu', array( $this, 'add_admin_bar_button' ), 100 );
	}

	public function ajax_trigger_application_webhook(): void {

		if ( false === Permissions::validate_ajax_crud_webhook() ) {
			wp_send_json_error( [ 'message' => 'Unauthorized' ], 403 );
		}

		$payload = (array) apply_filters(
			'blank_application_webhook_body_payload',
			[ 'action' => 'flush_cache' ]
		);

		$sanitized_payload = [];
		foreach ( $payload as $key => $value ) {
			$sanitized_payload[ sanitize_key( $key ) ] = sanitize_text_field( $value );
		}

		$admin_options = Options::read_options();

		try {
			$response = WebhookClient::post(
				$admin_options[ 'application_webhook_endpoint' ],
				$sanitized_payload
			);
		} catch ( \WP_Error $error ) {
			wp_send_json_error( $error );
		}

		wp_send_json_success( $response );
	}

	public function ajax_has_application_webhook_secret(): void {

		if ( false === Permissions::validate_ajax_crud_theme_options() ) {
			wp_send_json_error( [ 'message' => 'Unauthorized' ], 403 );
		}

		$has_secret = (bool) get_option('blank_theme_application_webhook_secret');

		wp_send_json_success([
			'has_secret' => $has_secret,
		], 200 );
	}

	public function ajax_update_application_webhook_secret(): void {

		if ( false === Permissions::validate_ajax_crud_theme_options() ) {
			wp_send_json_error( [ 'message' => 'Unauthorized' ], 403 );
		}

		$secret = wp_generate_password( 64, true );
		update_option( 'blank_theme_application_webhook_secret', $secret );

		wp_send_json_success(
			[
				'secret'  => $secret,
				'message' => esc_html__(
					'Copy this secret now. You will not be able to view it again.',
					'blank'
				),
			], 200 );
	}

	public function ajax_delete_application_webhook_secret(): void {

		if ( false === Permissions::validate_ajax_crud_theme_options() ) {
			wp_send_json_error( [ 'message' => 'Unauthorized' ], 403 );
		}

		$webhook = get_option( 'blank_theme_application_webhook_secret' );

		if ( ! empty($webhook) ) {
				
				update_option( 'blank_theme_application_webhook_secret', false );
				
				wp_send_json_success(
					[
						'message' => esc_html__( 'Webhook secret deleted.', 'blank' ),
					],
					200
				);
		} else {
			wp_send_json_success(
				[
					'message' => esc_html__( 'Webhook secret does not exists.', 'blank' ),
				],
				200
			);
		}

		wp_send_json_error(
			[
				'error' => esc_html__( 'An error occured while deleting Webhook secret.', 'blank' ),
			],
			200
		);
	}

	public function enqueue_scripts(): void {

		if ( ! current_user_can( 'blank_edit_theme_options' ) ) {
			return;
		}

		$theme   = wp_get_theme();
		$version = is_a( $theme, 'WP_Theme' ) ? sanitize_text_field( $theme->get( 'Version' ) ) : '1.0.0';

		wp_enqueue_script(
			'blank-theme-webhook',
			get_template_directory_uri() . '/assets/js/webhook.js',
			array( 'jquery-core' ),
			$version,
			array( 'in_footer' => true )
		);

		wp_localize_script(
			'blank-theme-webhook',
			'blankWebhookService',
			[
				'nonce'          => wp_create_nonce( 'blank_theme_webhook_nonce' ),
				'ajaxurl'        => admin_url( 'admin-ajax.php' ),
				'confirmMessage' => esc_html__( 'Flush Application Cache?', 'blank' ),
			]
		);
	}

	public function add_admin_bar_button( $admin_bar ): void {
		$admin_bar->add_node(
			[
				'id'    => 'blank-trigger-webhook',
				'title' => esc_html__( 'Flush Cache', 'blank' ),
				'href'  => '#',
				'meta'  => [
					'title'   => esc_html__( 'Flush Cache', 'blank' ),
					'onclick' => 'blankTriggerWebhook(); return false;',
				],
			]
		);
	}
}
