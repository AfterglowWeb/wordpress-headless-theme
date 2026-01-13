<?php namespace cmk\blank\Application;

defined( 'ABSPATH' ) || exit;

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
		add_action( 'wp_ajax_update_application_webhook_secret', array( $this, 'ajax_update_application_webhook_secret' ) );
		add_action( 'admin_bar_menu', array( $this, 'add_admin_bar_button' ), 100 );
	}

	public function ajax_trigger_application_webhook() {

		check_ajax_referer( 'blank_theme_webhook_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error(
				array(
					'error' => esc_html__( 'Unauthorized', 'blank' ),
				),
				401
			);
		}

		$payload = (array) apply_filters(
			'blank_application_webhook_body_payload',
			array(
				'action' => 'flush_cache',
			)
		);

		$sanitized_payload = array();
		foreach ( $payload as $key => $value ) {
			$sanitized_payload[ sanitize_key( $key ) ] = sanitize_text_field( $value );
		}

		$admin_options = Options::read_options();

		try {
			$response = WebhookClient::post(
				$admin_options['application_webhook_endpoint'],
				$sanitized_payload
			);
		} catch ( \WP_Error $error ) {
			wp_send_json_error( $error );
		}

		wp_send_json_success( $response );
	}

	public function ajax_update_application_webhook_secret() {

		check_ajax_referer( 'blank_theme_update_options_nonce', 'nonce' );

		if ( ! current_user_can( 'blank_edit_theme_options' ) ) {
			wp_send_json_error(
				array(
					'error' => esc_html__( 'Unauthorized', 'blank' ),
				),
				401
			);
		}

		wp_send_json_success(
			array(
				'secret'  => $this->update_webhook_secret(),
				'message' => esc_html__(
					'Copy this secret now. You will not be able to view it again.',
					'blank'
				),
			),
			200
		);
	}

	private function update_webhook_secret(): string {
		$secret = wp_generate_password( 64, true );
		update_option( 'blank_theme_application_webhook_secret', $secret );
		Options::update_options( array( 'application_webhook_secret_generated', true ) );

		return $secret;
	}

	public function enqueue_scripts() {

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
			array(
				'nonce'          => wp_create_nonce( 'blank_theme_webhook_nonce' ),
				'ajaxurl'        => admin_url( 'admin-ajax.php' ),
				'confirmMessage' => esc_html__( 'Flush Application Cache?', 'blank' ),
			)
		);
	}

	public function add_admin_bar_button( $admin_bar ) {
		$admin_bar->add_node(
			array(
				'id'    => 'blank-trigger-webhook',
				'title' => esc_html__( 'Flush Cache', 'blank' ),
				'href'  => '#',
				'meta'  => array(
					'title'   => esc_html__( 'Flush Cache', 'blank' ),
					'onclick' => 'blankTriggerWebhook(); return false;',
				),
			)
		);
	}
}
