<?php
namespace cmk\blank;

defined( 'ABSPATH' ) || exit;
class Admin {
	protected static $instance = null;

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {
		add_action( 'admin_menu', [ $this, 'register_admin_page' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_action( 'admin_footer', [ $this, 'print_inline_styles' ], 20 );
		add_action( 'wp_ajax_blank_theme_admin_options', [ $this, 'ajax_admin_options' ] );
	}

	public function register_admin_page() {
		add_menu_page(
			__( 'Blank Theme Admin', 'blank' ),
			__( 'Blank Theme', 'blank' ),
			'manage_options',
			'blank-theme-admin',
			[ $this, 'render_admin_page' ],
			'dashicons-admin-generic',
			2
		);
	}

	public function render_admin_page() {
		echo '<div id="blank-theme-admin-page"></div>';
	}

	public function enqueue_assets( $hook ) {
		if ( $hook !== 'toplevel_page_blank-theme-admin' ) {
			return;
		}

        wp_enqueue_script( 'wplink' );
		wp_enqueue_style( 'editor-buttons' );

		$mui_config = $this->load_script_config( get_template_directory() . '/build/mui.asset.php' );
        $mui_dependencies = ! empty( $mui_config ) && isset( $mui_config['dependencies'] ) ? $mui_config['dependencies'] : [];
		wp_enqueue_script(
			'blank-theme-mui',
			get_template_directory_uri() . '/build/mui.js',
			$mui_dependencies,
			$mui_config['version'],
			true
		);

		$script_config = $this->load_script_config( get_template_directory() . '/build/index.asset.php' );
        $dependencies = ! empty( $script_config ) && isset( $script_config['dependencies'] ) ? $script_config['dependencies'] : [];
		wp_enqueue_script(
			'blank-theme-admin',
			get_template_directory_uri() . '/build/index.js',
			array_merge(
				$dependencies,
				array( 'blank-theme-mui' )
			),
			$script_config['version'],
			true
		);

        $theme_object = wp_get_theme();
        wp_localize_script(
			'blank-theme-admin',
			'blankThemeAdminData',
			array(
				'nonce'                  => wp_create_nonce( 'blank_theme_admin_nonce' ),
				'ajaxurl'                => admin_url( 'admin-ajax.php' ),
				'users'             => self::list_users(),
				'admin_options'          => $this->get_admin_options(),
				'theme_name'             => $theme_object->get( 'Name' ),
				'theme_version'          => $theme_object->get( 'Version' ),
				'theme_uri'              => esc_url( $theme_object->get( 'ThemeURI' ) ),
				'home_url'                => esc_url( get_home_url('/') ),
			)
		);


	}

	public function print_inline_styles() {
		$hook = get_current_screen();
		if ( $hook->id !== 'toplevel_page_blank-theme-admin' ) {
			return;
		}
		$custom_css = '
		#blank-theme-admin-page input[type=color], 
		#blank-theme-admin-page input[type=date], 
		#blank-theme-admin-page input[type=datetime-local], 
		#blank-theme-admin-page input[type=datetime], 
		#blank-theme-admin-page input[type=email], 
		#blank-theme-admin-page input[type=month], 
		#blank-theme-admin-page input[type=number], 
		#blank-theme-admin-page input[type=password], 
		#blank-theme-admin-page input[type=search], 
		#blank-theme-admin-page input[type=tel], 
		#blank-theme-admin-page input[type=text], 
		#blank-theme-admin-page input[type=time], 
		#blank-theme-admin-page input[type=url], 
		#blank-theme-admin-page input[type=week] {
			box-shadow: unset;
			border-radius: 4px;
			border: 0;
			background-color: none;
			color: currentColor;
			padding: 16.5px 14px;
			line-height: normal;
			min-height: auto;
			height: 1.4375em;
}
		';
		echo '<style type="text/css">' . $custom_css . '</style>';
	}

	public function ajax_admin_options() {
		check_ajax_referer( 'blank_theme_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'error' => 'Unauthorized' ], 401 );
		}

		if ( isset( $_POST['action'] ) && $_POST['action'] === 'blank_theme_admin_options' && isset( $_POST['options'] ) ) {
			$options = json_decode( stripslashes( $_POST['options'] ), true );
			if ( ! is_array( $options ) ) {
				wp_send_json_error( [ 'error' => 'Invalid options data' ], 400 );
			}
			update_option( 'blank_theme_admin_options', $options );
			wp_send_json_success( [ 'message' => 'Options saved', 'options' => $options ] );
		} else {
			$options = $this->get_admin_options();
			wp_send_json_success( $options );
		}
	}

	public function get_admin_options() {
		$defaults = [
			'blank_allowed_roles' => [ 'administrator', 'editor' ],
			'rest_api_user_id' => 1,
			'rest_api_password_key' => 'rest_api',
			'application_user_id' => 1,
			'application_password_key' => 'flush_cache',
			'application_host' => 'https://www.my-host.com',
			'application_cache_route' => '/api/flush-cache',
			'disable_comments' => true,
			'max_upload_size' => wp_max_upload_size(),
		];
		$options = get_option( 'blank_theme_admin_options', [] );
		$options = wp_parse_args( $options, $defaults );
		return [
			'blank_allowed_roles' => [
				'label' => __( 'Allowed Roles', 'blank' ),
				'value' => array_map( 'sanitize_text_field', (array) $options['blank_allowed_roles'] ),
			],
			'rest_api_user_id' => [
				'label' => __( 'REST API User ID', 'blank' ),
				'value' => (int) sanitize_text_field( $options['rest_api_user_id'] ),
			],
			'rest_api_password_key' => [
				'label' => __( 'REST API Password Key', 'blank' ),
				'value' => (string) sanitize_text_field( $options['rest_api_password_key'] ),
			],
			'application_user_id' => [
				'label' => __( 'Application User ID', 'blank' ),
				'value' => (int) sanitize_text_field( $options['application_user_id'] ),
			],
			'application_password_key' => [
				'label' => __( 'Application Password Key', 'blank' ),
				'value' => (string) sanitize_text_field( $options['application_password_key'] ),
			],
			'application_host' => [
				'label' => __( 'Application Host', 'blank' ),
				'value' => (string) sanitize_text_field( $options['application_host'] ),
			],
			'application_cache_route' => [
				'label' => __( 'Application Cache Route', 'blank' ),
				'value' => (string) sanitize_text_field( $options['application_cache_route'] ),
			],
			'disable_comments' => [
				'label' => __( 'Disable Comments', 'blank' ),
				'value' => (bool) rest_sanitize_boolean( $options['disable_comments'] ),
			],
			'max_upload_size' => [
				'label' => __( 'Max Upload Size (bytes)', 'blank' ),
				'value' => (int) sanitize_text_field( $options['max_upload_size'] ),
			],
		];
	}

    /**
	 * Load the script configuration from a PHP asset file.
	 *
	 * @param string $file_path Path to the asset file.
	 *
	 * @return array Script configuration array.
	 */
	private static function load_script_config( $file_path ): array {
		$config = array();
		if ( is_readable( $file_path ) ) {
			$raw_config             = include realpath( $file_path );
			$config['dependencies'] = isset( $raw_config['dependencies'] ) ? array_map( 'sanitize_key', $raw_config['dependencies'] ) : array();
			$config['version']      = isset( $raw_config['version'] ) ? sanitize_text_field( $raw_config['version'] ) : '1.0.0';
		}
		return $config;
	}

    private static function list_users(): array {

		$allowed_roles = (array) get_option( 'blank_allowed_roles', self::get_admin_options()['blank_allowed_roles']['value'] );

		$users = get_users(
			array(
				'role__in' => $allowed_roles,
			)
		);
		$users_array = array();

		if ( is_array( $users ) && count( $users ) > 0 ) {
			foreach ( $users as $user ) {
				if ( false === is_a( $user, 'WP_User' ) ) {
					continue;
				}

				$user_id = isset( $user->ID ) ? (int) sanitize_text_field( wp_unslash( $user->ID ) ) : 0;

				$passwords = array();
				if ( class_exists( '\WP_Application_Passwords' ) ) {
					$app_passwords = \WP_Application_Passwords::get_user_application_passwords( $user_id );
					if ( is_array( $app_passwords ) ) {
						foreach ( $app_passwords as $ap ) {
							if ( isset( $ap['uuid'] ) && isset( $ap['name'] ) ) {
								$passwords[ $ap['uuid'] ] = $ap['name'];
							}
						}
					}
				}

				$users_array[] = array(
					'value'        => $user_id,
					'label'        => isset( $user->display_name ) ? sanitize_text_field( $user->display_name ) : '',
					'admin_url'    => isset( $user->user_url ) ? esc_url( get_edit_user_link( $user_id ) ) : '',
					'current_user' => get_current_user_id() === $user_id ? 1 : 0,
					'password_names' => $passwords,
				);
			}
		}
		return $users_array;
	}
}