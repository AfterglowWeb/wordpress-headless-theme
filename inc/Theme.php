<?php namespace cmk\blank;

defined( 'ABSPATH' ) || exit;

class Theme {


	protected static $instance = null;

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {
		add_action( 'after_setup_theme', array( $this, 'theme_lang' ) );
		add_action( 'after_setup_theme', array( $this, 'theme_supports' ) );
		add_action( 'after_setup_theme', array( $this, 'theme_menus' ) );
		add_action( 'after_setup_theme', array( $this, 'theme_remove' ) );
		//add_action( 'template_redirect', array( $this, 'redirect_front' ) );
		add_filter( 'xmlrpc_enabled', '__return_false' );
		add_filter( 'show_admin_bar', '__return_false' );
		add_filter( 'mime_types', array( $this, 'mime_support' ), 10, 1 );
		add_filter( 'wp_handle_upload_prefilter', array( $this, 'max_upload_size' ) );
		add_filter( 'the_content', array( $this, 'remove_empty_p_tags' ), 10, 1 );

		add_filter(
			'excerpt_length',
			function () {
				return 55;
			},
			999
		);
	}

	public function theme_supports(): void {
		add_theme_support( 'automatic-feed-links' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support(
			'html5',
			array(
				'search-form',
				'gallery',
				'caption',
			)
		);
		add_theme_support( 'menus' );
	}

	public function theme_remove(): void {
		if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
			define( 'DISALLOW_FILE_EDIT', true );
		}
		remove_action( 'admin_print_styles', 'print_emoji_styles' );
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
	}

	public function theme_menus(): void {

		try {
			$json_file = get_stylesheet_directory() . '/config/custom_menus.json';
			if ( ! file_exists( $json_file ) ) {
				new \WP_Error( 'Custom menus configuration file not found' );
			}

			$json_content = file_get_contents( $json_file );
			$custom_menus = json_decode( $json_content, true );

			if ( ! isset( $custom_menus['custom_menus'] ) ) {
				new \WP_Error( 'Invalid custom menus configuration' );
			}

			$formated_menus = array();

			foreach ( $custom_menus['custom_menus'] as $menu ) {
				$formated_menus[ $menu['slug'] ] = $menu['name'];
			}

			register_nav_menus( $formated_menus );

		} catch ( \Exception $e ) {
			new \WP_Error( 'Error loading custom menus: ' . $e->getMessage() );
		}
	}

	public function theme_lang(): void {
		if ( defined( 'WP_LANG_DIR' ) ) {

			$this->may_copy_theme_lang_to_languages_dir();

			load_theme_textdomain( 'blank', WP_LANG_DIR . '/themes' );
		} else {
			load_theme_textdomain( 'blank', get_stylesheet_directory() . '/languages' );
		}
	}

	private function may_copy_theme_lang_to_languages_dir(): void {

		if ( false === is_admin() || false === defined( 'WP_LANG_DIR' ) ) {
			return;
		}

		$theme_lang_dir = realpath( get_stylesheet_directory() . '/languages' );
		if ( false === is_admin() || false === defined( 'WP_LANG_DIR' ) ) {
			return;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		global $wp_filesystem;
		if ( ! $wp_filesystem ) {
			WP_Filesystem();
		}

		if ( ! $wp_filesystem || ! $wp_filesystem->is_dir( $theme_lang_dir ) ) {
			return;
		}

		$extensions        = array( 'mo', 'po', 'json' );
		$source_lang_files = array();
		foreach ( $extensions as $ext ) {
			$files = glob( $theme_lang_dir . '/*.' . $ext );
			if ( is_array( $files ) && ! empty( $files ) ) {
				$source_lang_files = array_merge( $source_lang_files, $files );
			}
		}
		if ( empty( $source_lang_files ) ) {
			return;
		}

		$target_lang_dir = WP_LANG_DIR . '/themes';
		if ( $wp_filesystem->is_writable( $target_lang_dir ) ) {
			foreach ( $source_lang_files as $file ) {
				$filename    = basename( $file );
				$target_file = $target_lang_dir . '/' . $filename;
				if ( ! $wp_filesystem->is_readable( $target_file ) || filemtime( $file ) > filemtime( $target_file ) ) {
					$wp_filesystem->copy( $file, $target_file );
				}
			}
		}
	}

	public function redirect_front(): void {

		if( is_front_page() || is_home() || is_admin() || wp_doing_ajax() ) {
			return;
		}

		$redirect_url = esc_url( apply_filters( 'blank_redirect_url', home_url() ) );

		wp_safe_redirect( apply_filters( 'allowed_redirect_hosts', $redirect_url ) );
		exit;
		
	}

	public function remove_empty_p_tags( $content ): string {
		$to_fix = array(
			'<p></p>' => '',
			'<p>['    => '[',
			']</p>'   => ']',
			']<br />' => ']',
		);
		return strtr( $content, $to_fix );
	}

	public function mime_support( $mimes ): array {
		$mimes['svg']  = 'image/svg+xml';
		$mimes['webp'] = 'image/webp';
		$mimes['csv']  = 'text/csv';
		return $mimes;
	}

	public function max_upload_size( $file ) {
	
		if( ! isset( $file['type'] ) || ! isset( $file['size'] ) ) {
			return $file;
		}

		$max_file_size = apply_filters('blank_max_upload_size', 500 * 1024); // 500 KB.

		if ( strpos( $file['type'], 'image' ) !== false && $file['size'] > $max_file_size ) {
			$file['error'] = 'Le poids maximum des images est fixé à 500ko. Utilisez le format .webp pour réduire le poids des images.';
		}

		return $file;
	}
}
