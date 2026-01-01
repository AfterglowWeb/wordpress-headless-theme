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
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'admin_footer', [ $this, 'print_inline_styles' ], 20 );
		add_action( 'wp_ajax_blank_theme_update_options', [ $this, 'update_options' ] );
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

	public function enqueue_scripts( $hook ) {
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
				'nonce'                  => wp_create_nonce( 'blank_theme_update_options_nonce' ),
				'ajaxurl'                => admin_url( 'admin-ajax.php' ),
				'users'                  => self::list_users(),
				'admin_options'          => self::read_admin_options( true ),
				'theme_name'             => $theme_object->get( 'Name' ),
				'theme_version'          => $theme_object->get( 'Version' ),
				'theme_uri'              => esc_url( $theme_object->get( 'ThemeURI' ) ),
				'home_url'               => esc_url( get_home_url('/') ),
			)
		);


	}

	public function print_inline_styles() {
		$hook = get_current_screen();
		if ( $hook->id !== 'toplevel_page_blank-theme-admin' ) {
			return;
		}
		$custom_css = '
		body.toplevel_page_blank-theme-admin #wpcontent {
			padding-left:0;
		}
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


	private static function get_default_options() {
		 return [
			'blank_allowed_roles' => [ 'administrator', 'editor' ],
			'blank_allowed_post_types' => [ 'post', 'page' ],
			'rest_api_user_id' => 1,
			'rest_api_password_name' => 'rest_api',
			'application_user_id' => 1,
			'application_password_name' => 'flush_cache',
			'application_host' => 'https://www.my-host.com',
			'application_cache_route' => '/api/flush-cache',
			'disable_comments' => true,
			'max_upload_size' => 1024, // 1Mo in Ko
			'enable_max_upload_size' => false,
		];
	}

	public function update_options() {
		check_ajax_referer( 'blank_theme_update_options_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'error' => 'Unauthorized' ], 401 );
		}

		if ( isset( $_POST['action'] ) && $_POST['action'] === 'blank_theme_update_options' && isset( $_POST['options'] ) ) {
			$options = json_decode( stripslashes( $_POST['options'] ), true );
			if ( ! is_array( $options ) ) {
				wp_send_json_error( [ 'error' => 'Invalid options data' ], 400 );
			}


			$options = self::sanitize_admin_options( $options );
			$options = wp_parse_args( $options, self::get_default_options() );

			update_option( 'blank_theme_options', $options );

			wp_send_json_success( [ 'message' => 'Options saved', 'options' => $options ] );
		} else {
			$options = self::read_admin_options();
			wp_send_json_success( $options );
		}
	}

	public static function read_admin_options($decorate = false) {

		$options = get_option( 'blank_theme_options', [] );
		$options = self::sanitize_admin_options( $options );

		$options = wp_parse_args( $options, self::get_default_options() );

		if( false === $decorate ) {
			return $options;
		}

		return self::decorate_admin_options($options);
	}

	private static function sanitize_admin_options(array $options): array {
		return [
			'blank_allowed_roles' => isset($options['blank_allowed_roles']) ? array_map('sanitize_key', (array)$options['blank_allowed_roles']) : ['administrator', 'editor'],
			'blank_allowed_post_types' => isset($options['blank_allowed_post_types']) ? array_map('sanitize_key', (array)$options['blank_allowed_post_types']) : ['post', 'page'],
			'rest_api_user_id' => isset($options['rest_api_user_id']) ? (int) sanitize_text_field($options['rest_api_user_id']) : 0,
			'rest_api_password_name' => isset($options['rest_api_password_name']) ? (string) sanitize_text_field($options['rest_api_password_name']) : '',
			'application_user_id' => isset($options['application_user_id']) ? (int) sanitize_text_field($options['application_user_id'] ) : 0, 
			'application_password_name' => isset($options['application_password_name']) ? (string) sanitize_text_field($options['application_password_name']) : '',
			'application_host' => isset($options['application_host']) ? (string) sanitize_text_field($options['application_host']) : '',
			'application_cache_route' => isset($options['application_cache_route']) ? (string) sanitize_text_field($options['application_cache_route']) : '',
			'disable_comments' => isset($options['disable_comments']) ? (bool) rest_sanitize_boolean($options['disable_comments']) : false,
			'max_upload_size' => isset($options['max_upload_size']) ? (int) sanitize_text_field($options['max_upload_size']) : 1024, // store in Ko
			'enable_max_upload_size' => isset($options['enable_max_upload_size']) ? (bool) rest_sanitize_boolean($options['enable_max_upload_size']) : false,
		];
	}

	private static function decorate_admin_options(array $options): array {
		return [
			'blank_allowed_roles' => [
				'label' => __( 'Allowed Roles', 'blank' ),
				'value' => $options['blank_allowed_roles'],
			],
			'blank_allowed_post_types' => [
				'label' => __( 'Allowed Post Types', 'blank' ),
				'value' => $options['blank_allowed_post_types'],
			],
			'rest_api_user_id' => [
				'label' => __( 'REST API User', 'blank' ),
				'value' => $options['rest_api_user_id'],
			],
			'rest_api_password_name' => [
				'label' => __( 'REST API Password Key', 'blank' ),
				'value' => $options['rest_api_password_name'],
			],
			'application_user_id' => [
				'label' => __( 'Application User', 'blank' ),
				'value' => $options['application_user_id'],
			],
			'application_password_name' => [
				'label' => __( 'Application Password Key', 'blank' ),
				'value' => $options['application_password_name'],
			],
			'application_host' => [
				'label' => __( 'Application Host', 'blank' ),
				'value' => $options['application_host'],
			],
			'application_cache_route' => [
				'label' => __( 'Application Cache Route', 'blank' ),
				'value' => $options['application_cache_route'],
			],
			'disable_comments' => [
				'label' => __( 'Disable Comments', 'blank' ),
				'value' => $options['disable_comments'],
			],
			'max_upload_size' => [
				'label' => __( 'Max Upload Size', 'blank' ),
				'value' => $options['max_upload_size'],
				'min' => 1,
				'max' => 1024,
			],
			'enable_max_upload_size' => [
				'label' => __( 'Enable Max Upload Size', 'blank' ),
				'value' => $options['enable_max_upload_size'],
			]
		];
	}

	public static function is_user_allowed( int $user_id, array $options):bool {
		
		$allowed_roles = isset($options['blank_allowed_roles']) ? array_map('sanitize_text_field', (array) $options['blank_allowed_roles']) : ['administrator', 'editor'];
		$user_meta = get_userdata($user_id);

		if( ! is_a( $user_meta, 'WP_User' ) ) {
			return false;
		}

		$user_roles = $user_meta->roles; 

		error_log('user_roles' . print_r(  $user_meta ));

		if ( in_array( $user_roles, $allowed_roles) ) {
			return true;
		}
		return false;
	}

	public static function is_post_type_allowed(string $post_type): bool {
		
		if ( ! post_type_exists( $post_type ) ) {
			return false;
		}

		$admin_options = self::read_admin_options();
		$blank_allowed_post_types = (array) apply_filters( 'blank_allowed_post_types', $admin_options['blank_allowed_post_types'] );

		if ( ! in_array( $post_type, $blank_allowed_post_types, true ) ) {
			return false;
		}

		return true;
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

		$admin_options = self::read_admin_options();
		$allowed_roles = $admin_options['blank_allowed_roles'];

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
							if ( isset( $ap['name'] ) ) {
								$passwords[] = $ap['name'];
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