<?php namespace cmk\blank\Rest;

use cmk\blank\Admin\Options;

class Context {

	public bool $use_core_rest;
	public bool $with_acf;
	public bool $embed_terms;
	public bool $embed_author;
	public bool $embed_featured_attachment;
	public bool $embed_attachments;
	public bool $relative_urls;
	public bool $relative_attachment_urls;

	public static function from_options(): self {
		$context                            = new self();
		$context->relative_urls             = (bool) Options::read_option( 'blank_relative_url_enabled' );
		$context->relative_attachment_urls  = (bool) Options::read_option( 'blank_relative_attachment_url_enabled' );
		$context->embed_featured_attachment = (bool) Options::read_option( 'blank_embed_featured_attachment_enabled' );
		$context->embed_attachments         = (bool) Options::read_option( 'blank_embed_post_attachments_enabled' );
		$context->embed_terms               = (bool) Options::read_option( 'blank_embed_terms_enabled' );
		$context->embed_author              = (bool) Options::read_option( 'blank_embed_authors_enabled' );
		$context->with_acf                  = (bool) Options::read_option( 'blank_with_acf_enabled' );
		$context->use_core_rest             = (bool) Options::read_option( 'blank_use_core_rest_enabled' );
		return $context;
	}
}
