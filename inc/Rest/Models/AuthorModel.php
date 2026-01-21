<?php namespace cmk\blank\Rest\Models;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Rest\Context;
use WP_User;
use WP_Post;

class AuthorModel {

	public function build( WP_User $author, WP_Post $parent_post, Context $context ): array {

		$context = apply_filters(
			'blank_rest_author_context',
			$context,
			$parent_post,
			$author
		);

		$data = $this->base_fields( $author, $context );

		$data = apply_filters(
			'blank_rest_author_build',
			$data,
			$author,
			$context
		);

		$data = apply_filters(
			'blank_rest_author_fields',
			$data,
			$author,
			$context
		);

		return apply_filters(
			'blank_rest_author',
			$data,
			$author,
			$context
		);
	}

	protected function base_fields( WP_User $user, Context $context ): array {

		$data = array(
			'nickname'     => $user->get( 'nickname' ),
			'first_name'   => $user->get( 'first_name' ),
			'last_name'    => $user->get( 'last_name' ),
			'display_name' => $user->get( 'display_name' ),
		);

		return $data;
	}
}
