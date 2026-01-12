<?php namespace cmk\blank\Application;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Admin;

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
		add_action( 'wp_ajax_flush_application_cache', array( $this, 'ajax_flush_application_cache' ) );
		add_action( 'admin_bar_menu', array( $this, 'add_admin_bar_button' ), 100 );
	}

	public function ajax_flush_application_cache() {
		check_ajax_referer( 'blank_theme_webhook_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'error' => esc_html__( 'Unauthorized', 'blank' ) ), 401 );
			wp_die();
		}

		$admin_options = Admin::read_admin_options();

		try {
			$response = WebhookClient::post(
				$admin_options['application_cache_route'],
				array(
					'action' => 'flush_cache',
				)
			);
		} catch ( \WP_Error $error ) {
			wp_send_json_error( $error );
		}

		wp_send_json_success( $response );
		wp_die();
	}

	public function enqueue_scripts() {

		if ( ! current_user_can( 'manage_options' ) ) {
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
				'nonce'   => wp_create_nonce( 'blank_theme_webhook_nonce' ),
				'ajaxurl' => admin_url( 'admin-ajax.php' ),
			)
		);
	}

	public function add_admin_bar_button( $admin_bar ) {
		$admin_bar->add_node(
			array(
				'id'    => 'blank-flush-cache',
				'title' => esc_html__( 'Flush Cache', 'blank' ),
				'href'  => '#',
				'meta'  => array(
					'title'   => esc_html__( 'Flush Cache', 'blank' ),
					'onclick' => 'blankFlushApplicationCache(); return false;',
				),
			)
		);
	}
}