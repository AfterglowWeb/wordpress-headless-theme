<?php namespace cmk\blank\Rest\Models;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Rest\Models\ModelContext;
use WP_Term;

class TermModel {

	public function build( WP_Term $term, ModelContext $context ): array {

		$context = apply_filters(
			'blank_rest_term_context',
			$context,
			$term
		);

		$data = $this->base_fields( $term, $context );

		$data = apply_filters(
			'blank_rest_term_build',
			$data,
			$term,
			$context
		);

		$data = apply_filters(
			'blank_rest_term_fields',
			$data,
			$term,
			$context
		);

		return apply_filters(
			'blank_rest_term',
			$data,
			$term,
			$context
		);
	}

	protected function base_fields( WP_Term $term, ModelContext $context ): array {

		$term = sanitize_term( $term, $term->taxonomy );

		$data = array(
			'id'          => (int) $term->term_id,
			'taxonomy'    => $term->taxonomy,
			'slug'        => $term->slug,
			'name'        => $term->name,
			'description' => $term->description,
			'count'       => (int) $term->count,
			'link'        => get_term_link( $term ),
		);

		if ( $context->relative_urls ) {
			$data['link'] = apply_filters(
				'blank_relative_url_enabled',
				get_term_link( $term )
			);
		}

		if ( $context->with_acf ) {
			$data['acf'] = apply_filters( 'blank_rest_term_acf', $term );
		}

		return $data;
	}
}
