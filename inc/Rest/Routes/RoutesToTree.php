<?php namespace cmk\blank\Rest\Routes;

class RoutesToTree {

	/**
	 * Public entry point
	 */
	public static function build_tree( array $flat_routes ): array {

		$tree = [];

		foreach ( $flat_routes as $route ) {

			$parsed = self::route_to_segments( $route['route'] );

            if ( empty( $parsed ) ) {
                continue;
            }

            $namespace = $parsed['namespace'];
            $segments  = $parsed['segments'];

            if ( ! isset( $tree[ $namespace ] ) ) {
                $tree[ $namespace ] = [
                    'id'       => self::node_id( '/' . $namespace ),
                    'label'    => $namespace,
                    'path'     => '/' . $namespace,
                    'children' => [],
                    'routes'   => [],
                    'meta'     => [
                        'type' => 'namespace',
                    ],
                ];
            }

            // Route directly attached to namespace (e.g. /wp/v2).
            if ( empty( $segments ) ) {
                $tree[ $namespace ]['routes'][] = self::build_route_entry( $route );
                continue;
            }

            self::insert_route(
                $tree[ $namespace ]['children'],
                $segments,
                $route,
                '/' . $namespace
            );

		}

		return self::normalize_tree( $tree );
	}

	/**
	 * Convert regex route to human-readable segments
	 * /wp/v2/posts/(?P<id>[\d]+) → ['wp','v2','posts','{id}']
	 */
	private static function route_to_segments( string $route ): array {

        $route = trim( $route, '/' );

        if ( $route === '' ) {
            return [];
        }

        $parts = explode( '/', $route );

        if ( count( $parts ) < 2 ) {
            return [];
        }

        // Merge namespace: wp/v2, blank/v1, batch/v1, etc.
        $namespace = $parts[0] . '/' . $parts[1];

        $segments = array_slice( $parts, 2 );

        $segments = array_map(
            function ( $part ) {
                if ( preg_match( '#\(\?P<([^>]+)>#', $part, $m ) ) {
                    return '{' . $m[1] . '}';
                }
                return $part;
            },
            $segments
        );

        return [
            'namespace' => $namespace,
            'segments'  => $segments,
        ];
    }

	private static function insert_route( 
    array &$tree,
    array $segments,
    array $route,
    string $base_path = '' ): void {

		$current =& $tree;
		$path = $base_path;

		foreach ( $segments as $index => $segment ) {

			$path .= '/' . $segment;

			if ( ! isset( $current[ $segment ] ) ) {
				$current[ $segment ] = [
					'id'       => self::node_id( $path ),
					'label'    => $segment,
					'path'     => $path,
					'children' => [],
					'routes'   => [],
				];
			}

			$currentNode =& $current[ $segment ];

			if ( $index === count( $segments ) - 1 ) {

				$existingIndex = null;
				foreach ( $currentNode['routes'] as $i => $r ) {
					if ( $r['method'] === $route['method'] && $r['route'] === $route['route'] ) {
						$existingIndex = $i;
						break;
					}
				}

				if ( $existingIndex !== null ) {
					$currentNode['routes'][ $existingIndex ]['settings'] = array_merge(
						$currentNode['routes'][ $existingIndex ]['settings'] ?? [],
						[
							'protect'  => false,
							'disabled' => false,
							'tags'     => [],
						]
					);
				} else {
					// Add new route
					$currentNode['routes'][] = self::build_route_entry( $route );
				}
			}

			$current =& $currentNode['children'];
		}
	}

	private static function build_route_entry( array $route ): array {

		return [
			'uuid'   => self::route_uuid( $route ),
			'method' => $route['method'],
			'route'  => $route['route'],
			'params' => $route['params'],
			'settings' => [
				'protect'  => false,
				'disabled' => false, // NEW
				'tags'     => [],
			],
			'permission' => [
				'type'     => $route['permission_type'],
				'callback' => $route['permission_callback'],
			],
		];
	}

	private static function node_id( string $path ): string {
		return md5( $path );
	}

	private static function route_uuid( array $route ): string {
		return md5( $route['route'] . '|' . $route['method'] );
	}

	private static function normalize_tree( array $tree ): array {

		$out = [];

		foreach ( $tree as $node ) {

			if ( ! empty( $node['children'] ) ) {
				$node['children'] = self::normalize_tree( $node['children'] );
			} else {
				unset( $node['children'] );
			}

			if ( empty( $node['routes'] ) ) {
				unset( $node['routes'] );
			}

			if ( empty( $node['meta'] ) ) {
				unset( $node['meta'] );
			}

			$out[] = $node;
		}

		return $out;
	}
    
}
