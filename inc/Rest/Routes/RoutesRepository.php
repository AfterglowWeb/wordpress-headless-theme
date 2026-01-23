<?php namespace cmk\blank\Rest\Routes;

defined( 'ABSPATH' ) || exit;

use cmk\blank\Admin\Permissions;
use cmk\blank\Rest\Routes\RoutesToTree;

class RoutesRepository {

    protected static $instance = null;

	private const OPTION_KEY = 'blank_rest_policy_diff';
	
	private static ?array $diff_cache = null;



	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	private function __construct() {
		add_action( 'wp_ajax_list_wp_v2_routes', array( $this, 'ajax_list_wp_v2_routes' ) );
	}


    public function ajax_list_wp_v2_routes() {
        if ( false === Permissions::validate_ajax_crud_theme_options() ) {
            wp_send_json_error( [ 'message' => 'Unauthorized' ], 403 );
        }

        $routes_tree = self::get_rest_routes_tree();
		wp_send_json_success( $routes_tree, 200 );
	}

	public static function get_rest_routes_tree(): array {

		$flat = self::list_all_rest_routes();
		$tree = RoutesToTree::build_tree( $flat );
		$diff = self::get_diff();
		return self::apply_diff( $tree, $diff );
	}

	private static function list_all_rest_routes() {
			do_action( 'rest_api_init' );

			$server = rest_get_server();
			$routes = $server->get_routes();

			$output = [];

			foreach ( $routes as $route => $endpoints ) {

				foreach ( $endpoints as $endpoint ) {

					$methods = array_keys( $endpoint['methods'] ?? [] );
					if ( empty( $methods ) ) {
						continue;
					}

					foreach ( $methods as $method ) {

						$permission_cb = $endpoint['permission_callback'] ?? null;
						$route_params = self::extract_route_params( $route );

						$output[] = [
							'route' => $route,
							'params' => $route_params,
							'method' => $method,
							'callback' => self::normalize_callable(
								$endpoint['callback'] ?? null
							),
							'permission_callback' => self::normalize_callable(
								$permission_cb
							),
							'permission_type' => self::describe_permission_callback(
								$permission_cb
							),
							'show_in_index' => (bool) ( $endpoint['show_in_index'] ?? false ),
							'namespace' => explode( '/', trim( $route, '/' ) )[0] ?? '',
						];

					}
				}
			}

			return $output;
	}

	private static function normalize_callable( $callable ) {

		if ( is_string( $callable ) ) {
			return $callable;
		}

		if ( is_array( $callable ) && isset( $callable[0], $callable[1] ) ) {
			if ( is_object( $callable[0] ) ) {
				return get_class( $callable[0] ) . '::' . $callable[1];
			}

			if ( is_string( $callable[0] ) ) {
				return $callable[0] . '::' . $callable[1];
			}
		}

		if ( $callable instanceof \Closure ) {
			return 'closure';
		}

		return null;
	}

	private static function describe_permission_callback( $cb ): string {

		if ( empty( $cb ) ) {
			return 'public';
		}

		if ( $cb === '__return_true' ) {
			return 'public';
		}

		if ( $cb === '__return_false' ) {
			return 'forbidden';
		}

		if ( $cb instanceof \Closure ) {
			return 'custom';
		}

		if ( is_array( $cb ) ) {
			return 'protected';
		}

		return 'custom';
	}

	private static function extract_route_params( string $route ): array {

		preg_match_all(
			'#\(\?P<([^>]+)>([^)]+)\)#',
			$route,
			$matches,
			PREG_SET_ORDER
		);

		$params = [];

		foreach ( $matches as $match ) {
			$params[] = [
				'name'  => $match[1],
				'regex' => $match[2],
			];
		}

		return $params;
	}

	private static function apply_diff( array $tree, array $diff ): array {

		foreach ( $tree as &$namespace ) {
			self::apply_node_diff( $namespace, $diff );
		}

		return $tree;
	}

	private static function apply_node_diff( array &$node, array $diff ): void {

		// Node-level override
		if ( isset( $node['uuid'], $diff['nodes'][ $node['uuid'] ] ) ) {
			$node['settings'] = array_merge(
				$node['settings'] ?? [],
				$diff['nodes'][ $node['uuid'] ]
			);
		}

		// Route-level override
		if ( ! empty( $node['routes'] ) ) {
			foreach ( $node['routes'] as &$route ) {
				if ( isset( $diff['routes'][ $route['uuid'] ] ) ) {
					$route['settings'] = array_merge(
						$route['settings'] ?? [],
						$diff['routes'][ $route['uuid'] ]
					);
				}
			}
		}

		// Recurse
		if ( ! empty( $node['children'] ) ) {
			foreach ( $node['children'] as &$child ) {
				self::apply_node_diff( $child, $diff );
			}
		}
	}

		public static function save_diff( array $diff ): void {

		$diff = [
			'nodes'  => $diff['nodes']  ?? [],
			'routes' => $diff['routes'] ?? [],
		];

		update_option( self::OPTION_KEY, $diff, false );

		self::$diff_cache = $diff;
	}

	public static function get_diff(): array {

		if ( self::$diff_cache !== null ) {
			return self::$diff_cache;
		}

		$stored = get_option( self::OPTION_KEY, null );

		if ( ! is_array( $stored ) ) {
			$stored = [
				'nodes'  => [],
				'routes' => [],
			];
		}

		self::$diff_cache = $stored;

		return self::$diff_cache;
	}

	public static function flush(): void {
		self::$diff_cache = null;
	}

}