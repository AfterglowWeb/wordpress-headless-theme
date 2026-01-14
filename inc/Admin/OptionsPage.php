<?php
namespace cmk\blank\Admin;

defined( 'ABSPATH' ) || exit;

class OptionsPage {
	protected static $instance = null;

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {
		add_action(
			'admin_init',
			function () {
				$role_object = get_role( 'administrator' );
				$role_object->add_cap( 'blank_edit_theme_options' );
			}
		);
		add_action( 'admin_menu', array( $this, 'register_admin_page' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'admin_footer', array( $this, 'print_inline_styles' ), 20 );

		add_action( 'wp_ajax_blank_theme_update_options', array( $this, 'ajax_update_options' ) );
		add_action( 'wp_ajax_blank_theme_read_options', array( $this, 'ajax_read_options' ) );
		add_action( 'wp_ajax_blank_theme_documentation', array(  $this, 'ajax_documentation' ) );

	}

	public function register_admin_page() {
		add_menu_page(
			__( 'Blank Theme Admin', 'blank' ),
			__( 'Blank Theme', 'blank' ),
			'blank_edit_theme_options',
			'blank-theme-admin',
			array( $this, 'render_admin_page' ),
			'dashicons-hidden',
			99
		);
	}

	public function render_admin_page() {
		echo '<div id="blank-theme-admin-page"></div>';
	}

	public function enqueue_scripts( $hook ) {
		if ( 'toplevel_page_blank-theme-admin' !== $hook ) {
			return;
		}

		wp_enqueue_script( 'wplink' );
		wp_enqueue_style( 'editor-buttons' );

		$mui_config       = $this->load_script_config( get_template_directory() . '/build/mui.asset.php' );
		$mui_dependencies = ! empty( $mui_config ) && isset( $mui_config['dependencies'] ) ? $mui_config['dependencies'] : array();
		wp_enqueue_script(
			'blank-theme-mui',
			get_template_directory_uri() . '/build/mui.js',
			$mui_dependencies,
			$mui_config['version'],
			true
		);

		$script_config = $this->load_script_config( get_template_directory() . '/build/index.asset.php' );
		$dependencies  = ! empty( $script_config ) && isset( $script_config['dependencies'] ) ? $script_config['dependencies'] : array();
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

		$theme        = wp_get_theme();
		$theme_object = is_a( $theme, '\WP_Theme' ) ? $theme : null;

		wp_localize_script(
			'blank-theme-admin',
			'blankThemeAdminData',
			array(
				'nonce'         => wp_create_nonce( 'blank_theme_update_options_nonce' ),
				'ajaxurl'       => admin_url( 'admin-ajax.php' ),
				'users'         => self::list_users(),
				'post_types'    => self::list_post_types(),
				'admin_options' => Options::read_options(),
				'theme_name'    => $theme_object ? sanitize_text_field( $theme_object->get( 'Name' ) ) : '',
				'theme_domain'  => $theme_object ? sanitize_key( $theme->get( 'Domain' ) ) : '',
				'theme_version' => $theme_object ? sanitize_text_field( $theme_object->get( 'Version' ) ) : '',
				'theme_uri'     => $theme_object ? sanitize_url( $theme_object->get( 'ThemeURI' ) ) : '',
				'home_url'      => get_home_url( '/' ),
			)
		);
	}

	public function ajax_read_options() {
		check_ajax_referer( 'blank_theme_read_options_nonce', 'nonce' );
		if ( ! current_user_can( 'blank_edit_theme_options' ) ) {
			wp_send_json_error( array( 'error' => esc_html__( 'Unauthorized', 'blank' ) ), 401 );
		}

		$options = Options::read_options();
		wp_send_json_success( $options );
	}

	public function ajax_documentation() {
		check_ajax_referer( 'blank_theme_read_options_nonce', 'nonce' );
		if ( ! current_user_can( 'blank_edit_theme_options' ) ) {
			wp_send_json_error( array( 'error' => esc_html__( 'Unauthorized', 'blank' ) ), 401 );
		}

		$documentation_pages = Documentation::read_pages();
		wp_send_json_success( $documentation_pages );
	}


	public function ajax_update_options() {
		check_ajax_referer( 'blank_theme_update_options_nonce', 'nonce' );
		if ( ! current_user_can( 'blank_edit_theme_options' ) ) {
			wp_send_json_error( array( 'error' => esc_html__( 'Unauthorized', 'blank' ) ), 401 );
		}

		if ( isset( $_POST['action'] ) && 'blank_theme_update_options' === $_POST['action'] && isset( $_POST['options'] ) ) {

			$options = json_decode( sanitize_text_field( wp_unslash( $_POST['options'] ) ), true );
			if ( ! is_array( $options ) ) {
				wp_send_json_error( array( 'error' => esc_html__( 'Invalid options data', 'blank' ) ), 400 );
			}

			$options = Options::update_options( $options );

			wp_send_json_success(
				array(
					'message' => esc_html__( 'Options saved', 'blank' ),
					'options' => $options,
				)
			);
		} else {
			$options = Options::read_options();
			wp_send_json_success( $options );
		}
	}

	public function print_inline_styles() {
		$hook = get_current_screen();
		if ( 'toplevel_page_blank-theme-admin' !== $hook->id ) {
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

	private static function list_users(): array {

		$users       = get_users(
			array(
				'role__in' => array( 'administrator' ),
			)
		);
		$users_array = array();

		if ( is_array( $users ) && count( $users ) > 0 ) {
			foreach ( $users as $user ) {
				if ( false === is_a( $user, 'WP_User' ) ) {
					continue;
				}

				$user_id = isset( $user->ID ) ? (int) sanitize_text_field( wp_unslash( $user->ID ) ) : 0;

				$users_array[] = array(
					'value'        => $user_id,
					'label'        => isset( $user->display_name ) ? sanitize_text_field( $user->display_name ) : '',
					'admin_url'    => isset( $user->user_url ) ? sanitize_url( get_edit_user_link( $user_id ) ) : '',
					'current_user' => get_current_user_id() === $user_id ? 1 : 0,
				);
			}
		}
		return $users_array;
	}

	private static function list_post_types() {

		$post_types = get_post_types(
			array(
				'public' => true,
			),
			'objects'
		);
		if ( empty( $post_types ) ) {
			return;
		}

		$post_types = array_map(
			function ( $post_type ) {
				return array(
					'value' => $post_type->name,
					'label' => $post_type->labels->singular_name,
				);
			},
			$post_types
		);

		return array_values( $post_types );
	}

	private static function load_script_config( $file_path ): array {
		$config = array();
		if ( is_readable( $file_path ) ) {
			$raw_config             = include realpath( $file_path );
			$config['dependencies'] = isset( $raw_config['dependencies'] ) ? array_map( 'sanitize_key', $raw_config['dependencies'] ) : array();
			$config['version']      = isset( $raw_config['version'] ) ? sanitize_text_field( $raw_config['version'] ) : '1.0.0';
		}
		return $config;
	}
}
