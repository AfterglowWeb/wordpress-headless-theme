<?php namespace cmk\blank\Rest;

defined( 'ABSPATH' ) || exit;
use cmk\blank\Admin;
class Permissions {

    public static function sync_rest_api_user( array $new, array $old = [] ): void {
        if (
            ! empty( $old['rest_api_user_id'] )
            && (int) $old['rest_api_user_id'] !== (int) $new['rest_api_user_id']
        ) {
            self::remove_cap_from_user( (int) $old['rest_api_user_id'] );
        }

        if ( empty( $new['rest_api_user_id'] ) ) {
            return;
        }

        $user = get_user_by( 'id', (int) $new['rest_api_user_id'] );
        if ( ! $user ) {
            return;
        }

        $user->add_cap( 'blank_api_access' );
    }

    public static function remove_cap_from_user( int $user_id ): void {
        $user = get_user_by( 'id', $user_id );
        if ( $user ) {
            $user->remove_cap( 'blank_api_access' );
        }
    }

	public static function validate_rest_api_token(): bool {
		return is_user_logged_in()
			&& current_user_can( 'blank_api_access' );
	}

	public static function is_post_type_allowed( string $post_type ): bool {

		if ( ! post_type_exists( $post_type ) ) {
			return false;
		}

		$admin_options            = Admin::read_admin_options();
		$blank_allowed_post_types = (array)  $admin_options['blank_allowed_post_types'];

		if ( ! in_array( $post_type, $blank_allowed_post_types, true ) ) {
			return false;
		}

		return true;
	}

}