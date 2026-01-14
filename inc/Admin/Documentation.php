<?php
namespace cmk\blank\Admin;

use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\SmartPunct\SmartPunctExtension;
use League\CommonMark\Extension\Strikethrough\StrikethroughExtension;
use League\CommonMark\MarkdownConverter;

use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkExtension;
use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkRenderer;


class Documentation {
	protected static $instance = null;

	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {}

	public static function read_pages() {
		
		$docs_dir = trailingslashit( get_template_directory() ) . 'docs';

		if ( ! is_dir( $docs_dir ) ) {
			return [];
		}

		$pages = array(
			array(
				'slug' => 'getting-started', 
				'title' => __('Getting Started', 'blank'),
				'html' => '',
			),
			array(
				'slug' => 'options', 
				'title' => __('Options', 'blank'),
				'html' => '',
			),
			array(
				'slug' => 'hooks', 
				'title' => __('Hooks', 'blank'),
				'html' => '',
			),
			array(
				'slug' => 'faq', 
				'title' => __('FAQ', 'blank'),
				'html' => '',
			)
		);

		$config = [
			'heading_permalink' => [
				'html_class' => 'blank-docs-heading-permalink',
				'id_prefix' => 'blank_docs',
				'apply_id_to_heading' => false,
				'heading_class' => '',
				'fragment_prefix' => 'blank_docs',
				'insert' => 'before',
				'min_heading_level' => 1,
				'max_heading_level' => 6,
				'title' => 'Permalink',
				'symbol' => HeadingPermalinkRenderer::DEFAULT_SYMBOL,
				'aria_hidden' => true,
			],
		];

		$environment = new Environment($config);
		$environment->addExtension(new SmartPunctExtension());
		$environment->addExtension(new StrikethroughExtension());
		$environment->addExtension(new HeadingPermalinkExtension());

		$converter = new MarkdownConverter($environment);
		
		foreach ( $pages as $page ) {
			
			$file = realpath( $docs_dir . '/' . $page['slug'] . '.md' );
			$markdown = file_get_contents( $file );
			if ( ! $markdown ) {
				continue;
			}

			$result = $converter->convert($markdown);
			$html = $result->getContent();

			$slug  = sanitize_title( basename( $file, '.md' ) );
			$title = ucwords( str_replace( '-', ' ', $slug ) );

			$pages[] = [
				'slug'  => $slug,
				'title' => $title,
				'html'  => $html,
			];
		}

		return $pages;
	}


}
