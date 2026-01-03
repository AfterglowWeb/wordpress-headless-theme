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

        $admin_options = Admin::read_admin_options();
        
        $blank_application_cache_route = (string) sanitize_text_field( apply_filters('blank_application_cache_route', $admin_options['application_cache_route']) );

        if( ! $blank_application_cache_route ) {
            wp_send_json_error(['error' => 'Application host or cache route is not set'], 403);
            wp_die();
        }

        $response = self::fetch_application( $blank_application_cache_route, array( 'flush' => true ) );
        $code = $response['code'];
        $body = $response['body'];
        
        if (200 === $code && ! empty( $body['success'] )) {
            wp_send_json_success( array(
                'success'     => (bool) isset($body['success']) ? rest_sanitize_boolean($body['success']) : false,
                'timestamp'   => (string) isset($body['timestamp']) ? sanitize_text_field($body['timestamp']) : 0,
                'message'     => (string) isset($body['message']) ? sanitize_text_field($body['message']) : '',
            ), 200 );
            wp_die();
        } else {
            wp_send_json_error( array(
                'error' => isset( $body['error'] ) ? 
                    sprintf( esc_html__('Error %s', 'blank'), sanitize_text_field( $body['error']) ) 
                    : 
                    'Unknown Error',
            ), $code);
            wp_die();
        }
    }

    private function fetch_application( string $route, array $payload = [] ) {
        
        $admin_options = Admin::read_admin_options();

        $application_host = (string) sanitize_text_field( apply_filters('blank_application_host', $admin_options['application_host']) );
        $application_user = (int) sanitize_text_field( apply_filters('blank_application_user_id', $admin_options['application_user_id'] ) );
        $application_password_name = (string) sanitize_text_field( apply_filters('blank_application_password_name', $admin_options['application_password_name'] ) );
        
        $application_password = Utils::get_application_password($application_user, $application_password_name);

        if(! $application_password || ! $application_host ) {
            return array(
                'code' => 401,
                'body' => array(
                    'error' => 'Application credentials are not set'
                ),
            );
        }
        
        $server_ip = (string) isset($_SERVER['SERVER_ADDR']) ? sanitize_text_field( $_SERVER['SERVER_ADDR'] ) : gethostbyname(php_uname('n'));
        $theme = wp_get_theme();
        $theme_object = is_a( $theme, 'WP_Theme' ) ? $theme : null;

        $headers = (array) apply_filters( 'blank_application_headers_payload', array(
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $application_password,
            'Referer' => sanitize_url( site_url('/') ),
            'x-forwarded-for' => $server_ip,
            'x-wordpress-theme' => $theme_object ? sanitize_text_field( $theme->get('Name') ) : '',
            'x-wordpress-theme-domain' => $theme_object ? sanitize_key( $theme->get('Domain') ) : '',
            'x-wordpress-theme-version' => $theme_object ? sanitize_text_field( $theme->get('Version') ) : '',
        ));

        $payload = array_map('sanitize_text_field', apply_filters('blank_application_body_payload', $payload));

        $request_args = array(
            'headers' => $headers,
            'body' => json_encode( $payload ),
            'timeout' => 10,
            'sslverify' => defined('WP_ENVIRONMENT_TYPE') && 'local' === WP_ENVIRONMENT_TYPE ? false : true,
            'curl' => [
                CURLOPT_SSL_VERIFYPEER => defined('WP_ENVIRONMENT_TYPE') && 'local' === WP_ENVIRONMENT_TYPE ? false : true,
                CURLOPT_SSL_VERIFYHOST => defined('WP_ENVIRONMENT_TYPE') && 'local' === WP_ENVIRONMENT_TYPE ? false : true,
            ],
        );


        $application_endpoint = rtrim($application_host, '/') . $route;
        $response = wp_remote_post( $application_endpoint, $request_args);

        if ( is_wp_error( $response )) {
           return array(
                'code' => 500,
                'body' => array(
                    'error' => $response->get_error_message()
                )
            );
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        return array(
            'code' => $code,
            'body' => $body
        );
    
    }

}


