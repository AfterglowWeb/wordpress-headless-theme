<?php namespace cmk\blank;

defined('ABSPATH') || exit;

add_action(
	'admin_notices',
	function () {
		$theme_obj = wp_get_theme();
		
		if (!is_a($theme_obj, 'WP_Theme')) {
			return;
		}

		$requiers_wp = sanitize_text_field($theme_obj->get('RequiresWP'));
		$requiers_php = sanitize_text_field($theme_obj->get('RequiresPHP'));

		if (is_admin_screen('themes')) {
			if (version_compare(get_bloginfo('version'), $requiers_wp, '<')) {
				echo '<div class="notice notice-error"><p>';
				echo esc_html__('The Blank theme requires WordPress version ', 'blank') . esc_html($requiers_wp) . '. ';
				echo esc_html__('Please update WordPress to the latest version.', 'blank');
				echo '</p></div>';
			}

			if (version_compare(PHP_VERSION, $requiers_php, '<')) {
				echo '<div class="notice notice-error"><p>';
				echo esc_html__('The Blank theme requires PHP version ', 'blank') . esc_html($requiers_php) . '. ';
				echo esc_html__('Please update your PHP version.', 'blank');
				echo '</p></div>';
			}
		}
	}
);

if (file_exists(get_template_directory() . '/vendor/autoload.php')) {
	require_once realpath(get_template_directory() . '/vendor/autoload.php');
}

Theme::get_instance();
Acf::get_instance();
CustomPosts::get_instance();
DisableComments::get_instance();
RestExtend::get_instance();
Cache::get_instance();
Admin::get_instance();

function is_admin_screen( $screen_name ) {
	if ( ! is_admin() ) {
		return false;
	}

	$admin_screen = get_current_screen();
	if ( ! is_a( $admin_screen, 'WP_Screen' ) ) {
		return false;
	}
	if ( in_array($screen_name, array(
		$admin_screen->base,  
		$admin_screen->parent_base,
		$admin_screen->id
	), true) ) {
		return true;
	}
	
	return false;
}