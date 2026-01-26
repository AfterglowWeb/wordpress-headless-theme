<?php
namespace cmk\blank\Admin;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Admin\Permissions;
use cmk\blank\Core\Utils;

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
		add_action( 'wp_ajax_blank_theme_update_option', array( $this, 'ajax_update_option' ) );
		add_action( 'wp_ajax_blank_theme_read_options', array( $this, 'ajax_read_options' ) );
		add_action( 'wp_ajax_blank_theme_documentation', array( $this, 'ajax_documentation' ) );
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

	public function ajax_read_options() {
		if ( false === Permissions::validate_ajax_crud_theme_options() ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ), 403 );
		}

		$options = Options::read_options();
		wp_send_json_success( $options );
	}

	public function ajax_update_options() {
		if ( false === Permissions::validate_ajax_crud_theme_options() ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ), 403 );
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

	public function ajax_update_option() {
		if ( false === Permissions::validate_ajax_crud_theme_options() ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ), 403 );
		}

		if ( isset( $_POST['action'] ) && 'blank_theme_update_option' === $_POST['action'] && isset( $_POST['option'] ) ) {

			$option = json_decode( sanitize_text_field( wp_unslash( $_POST['option'] ) ), true );
			if ( ! is_array( $option ) ) {
				wp_send_json_error( array( 'error' => esc_html__( 'Invalid option data', 'blank' ) ), 422 );
			}

			$key = isset( $option['key'] ) && ! empty( $option['key'] ) ? $option['key'] : '';
			$value = isset( $option['value'] ) && ! empty( $option['value'] ) ? $option['value'] : null;

			if ( empty( $key ) || empty( $value ) ) {
				wp_send_json_error( array( 'error' => esc_html__( 'Invalid option data', 'blank' ) ), 422 );
			}

			$option = Options::update_option( $key,  $value );

			wp_send_json_success(
				array(
					'message' => esc_html__( 'Options saved', 'blank' ),
					'option' => $option,
				)
			);
		} else {
			wp_send_json_error( 'Unknown parameter', 422 );
		}
	}

	public function ajax_documentation() {
		if ( false === Permissions::validate_ajax_crud_theme_options() ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ), 403 );
		}

		$documentation_pages = Documentation::read_pages();
		wp_send_json_success( $documentation_pages );
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
				'users'         => Utils::list_users(),
				'post_types'    => Utils::list_post_types(),
				'admin_options' => Options::read_options(),
				'theme_name'    => $theme_object ? sanitize_text_field( $theme_object->get( 'Name' ) ) : '',
				'theme_domain'  => $theme_object ? sanitize_key( $theme->get( 'Domain' ) ) : '',
				'theme_version' => $theme_object ? sanitize_text_field( $theme_object->get( 'Version' ) ) : '',
				'theme_uri'     => $theme_object ? sanitize_url( $theme_object->get( 'ThemeURI' ) ) : '',
				'home_url'      => get_home_url( '/' ),
			)
		);
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
