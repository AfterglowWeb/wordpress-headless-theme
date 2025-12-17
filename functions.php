<?php namespace cmk\blank;

defined('ABSPATH') || exit;

add_action(
	'admin_notices',
	function () {
		$theme_obj = wp_get_theme();
		
		if (!is_a($theme_obj, 'WP_Theme')) {
			return;
		}

		$theme_name = sanitize_text_field(wp_get_theme()->get('Name'));
		$requiersWP = sanitize_text_field(wp_get_theme()->get('RequiresWP'));
		$requiersPHP = sanitize_text_field(wp_get_theme()->get('RequiresPHP'));

		if (!is_admin_screen('themes')) {
			return;
		}

		if (version_compare(PHP_VERSION, $requiersPHP, '<')) {
			echo '<div class="error"><p>' . sprintf(
				esc_html__('%s Theme needs a PHP version superior or equal to %s','blank'),
				$theme_name,
				$requiersPHP
			) . '</p></div>';
		}

		if (version_compare(get_bloginfo('version'), $requiersWP, '<')) {

			echo '<div class="error"><p>' . sprintf(
				esc_html__('%s Theme needs a WordPress version superior or equal to %s','blank'),
				$theme_name,
				$requiersWP
			) . '</p></div>';
		}

		if (!class_exists('ACF')) {
			echo '<div class="notice"><p>' . sprintf(
				esc_html__('%s Theme needs Advanced Custom Fields plugin to support provided Gutenberg blocks.','blank'),
				$theme_name
			) . '</p></div>';
		}
	}
);

include_once realpath(__DIR__ . '/inc/Theme.php');
include_once realpath(__DIR__ . '/inc/CustomPosts.php');
include_once realpath(__DIR__ . '/inc/DisableComments.php');
include_once realpath(__DIR__ . '/inc/Acf.php');
include_once realpath(__DIR__ . '/inc/RestExtend.php');

Theme::get_instance();
Acf::get_instance();
CustomPosts::get_instance();
DisableComments::get_instance();
RestExtend::get_instance();

function is_admin_screen( $screenName ) {
		if ( ! is_admin() ) {
			return false;
		}
		$adminScreen = get_current_screen();
		if ( ! is_a( $adminScreen, 'WP_Screen' ) ) {
			return false;
		}
		if ( $adminScreen->base == $screenName ) {
			return true;
		}
		if ( $adminScreen->id == $screenName ) {
			return true;
		}
		if ( $adminScreen->parent_base == $screenName ) {
			return true;
		}
		return false;
	}
