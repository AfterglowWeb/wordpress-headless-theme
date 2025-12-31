<?php namespace cmk\blank;

defined( 'ABSPATH' ) || exit;

class Cache {
	protected static $instance = null;

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

    private function __construct() {
        add_action('wp_ajax_blank_flush_application_cache', [$this, 'ajax_flush_application_cache']);
        add_action('admin_bar_menu', [$this, 'add_admin_bar_button'], 100);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_bar_script']);
    }

    public function add_admin_bar_button($wp_admin_bar) {
        if (!current_user_can('manage_options')) {
            return;
        }

        $wp_admin_bar->add_node([
            'id'    => 'blank-flush-cache',
            'title' => esc_html__('Flush Application Cache', 'blank'),
            'href'  => '#',
            'meta'  => [
                'title' => esc_html__('Flush Application Cache', 'blank'),
                'onclick' => 'blankFlushApplicationCache(); return false;',
            ],
        ]);
    }

    public function enqueue_admin_bar_script() {
        if (!current_user_can('manage_options')) {
            return;
        }

        wp_enqueue_script('blank_admin_bar', get_template_directory_uri() . '/assets/js/admin-bar.js', 'jquery-core', rand() );
        wp_localize_script('blank_admin_bar', 'blankAdminBar', array(
            'ajaxurl' => admin_url( 'admin-ajax.php', 'relative' ),
            'action' => 'blank_flush_application_cache',
            'nonce' => wp_create_nonce('blank_flush_application_cache_nonce'),
        ));
    }
 
    public function ajax_flush_application_cache() {

        if(false === check_ajax_referer('blank_flush_application_cache_nonce', 'nonce')) {
            wp_send_json_error(['error' => 'Invalid nonce'], 403);
            wp_die();
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['error' => 'Unauthorized'], 401);
            wp_die();
        }

        $application_user = (int) sanitize_text_field( apply_filters('blank_application_user_id', 1 ) );
        $application_password_key = (int) sanitize_text_field( apply_filters('blank_application_password_key', 'flush_cache' ) );
        $application_password = Utils::get_application_password($application_user, $application_password_key);

        if(! $application_password ) {
            wp_send_json_error(['error' => 'Application password is not set'], 401);
            wp_die();
        }

        $application_host = (string) sanitize_text_field( apply_filters('blank_application_host', 'https://www.my-host.com') );
        $application_flush_cache_route = (string) sanitize_text_field( apply_filters('blank_application_cache_route', '/api/flush-cache') );

        if(! $application_host || ! $application_flush_cache_route ) {
            wp_send_json_error(['error' => 'Application host or cache route is not set'], 403);
            wp_die();
        }

        $response = wp_remote_post(rest_url( $application_host , $application_flush_cache_route), [
            'headers' => [
                'Authorization' => 'Bearer ' . $application_password,
            ],
            'body' => json_encode(['flush' => true]),
            'timeout' => 10,
            'data_format' => 'body',
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error(['error' => $response->get_error_message()], 500);
            wp_die();
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code === 200 && !empty($body['success'])) {
            $forward_response = array(
                'success' => true,
                'flushed' => (bool) isset($body['flushed']) ? rest_sanitize_boolean($body['flushed']) : false,
                'timestamp' => (int) isset($body['timestamp']) ? sanitize_text_field($body['timestamp']) : 0,
                'message' => (string) isset($body['message']) ? sanitize_text_field($body['message']) : '',
            );
            wp_send_json_success($forward_response, 200);
            wp_die();
        } else {
            wp_send_json_error(['error' => $body['error'] ?? esc_html__('Unknown error', 'blank')], $code);
            wp_die();
        }

    }
}


