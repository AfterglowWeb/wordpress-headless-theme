# Hooks - Filters

## `blank_rest_post`
**Description:** Filter the REST API response for each post before it is returned.

**Arguments:**
- `$filtered_post` *(array)*: The associative array of post data to be returned.
- `$post` *(WP_Post)*: The original WP_Post object.

**Default props in `$filtered_post`:**
  - `id` (int)
  - `type` (string)
  - `title` (string)
  - `slug` (string)
  - `date` (string, ISO8601)
  - `modified` (string, ISO8601)
  - `link` (string, permalink)
  - `content` (string, HTML)
  - `excerpt` (string, HTML)
  - `terms` (array)
  - `images` (array)
  - `acf` (array)

**Example:**
```php
add_filter('blank_rest_post', function( array $filtered_post, \WP_Post $post ): array {
  $filtered_post['custom_prop'] = 'value';
  return $filtered_post;
}, 10, 2);
```

### `blank_rest_post_acf`
**Description:** Filter the ACF fields array for a post before it is returned in the REST API.

**Arguments:**
- `$acf_fields` *(array)*: The ACF fields for the post.
- `$post_id` *(int)*: The post ID.

**Example:**
```php
add_filter('blank_rest_post_acf', function( array $acf_fields, int $post_id ): array {
  unset($acf_fields['secret_field']);
  return $acf_fields;
}, 10, 2);
```

## `blank_rest_attachments_per_post`

## `blank_rest_attachment`
**Description:** Filter the properties of each attachment returned by the `/blank/v1/<post_type>/images` endpoint.

**Arguments:**
- `$filtered_image` *(array)*: The associative array of attachment data.
- `$img_id` *(int)*: The attachment ID.

**Default props in `$filtered_image`:**
  - `id` (int)
  - `src` (string, relative path)
  - `alt` (string)
  - `width` (int)
  - `height` (int)
  - `mime_type` (string)
  - `post_id` (int|null)
  - `field_key` (string)

**Example:**
```php
add_filter('blank_rest_attachment', function($filtered_image, $img_id) {
  $filtered_image['custom_prop'] = 'value';
  return $filtered_image;
}, 10, 2);
```

### `blank_rest_attachment_acf`

## `blank_rest_term`
**Description:** Filter the REST API response for each taxonomy term before it is returned.

**Arguments:**
- `$filtered_term` *(array)*: The associative array of term data to be returned.
- `$term` *(WP_Term)*: The original WP_Term object.

**Default props in `$filtered_term`:**
  - `id` (int)
  - `name` (string)
  - `slug` (string)
  - `description` (string)
  - `count` (int)
  - `acf` (array)

**Example:**
```php
add_filter('blank_rest_term', function( array $filtered_term, \WP_Term $term ): array {
  $filtered_term['icon'] = get_term_meta($term->term_id, 'icon', true);
  return $filtered_term;
}, 10, 2);
```

### `blank_rest_term_acf`
**Description:** Filter the ACF fields array for a term before it is returned in the REST API.

**Arguments:**
- `$acf_fields` *(array)*: The ACF fields for the term.
- `$term_id` *(int)*: The term ID.

**Example:**
```php
add_filter('blank_rest_term_acf', function( array $acf_fields, int $term_id ): array {
  unset($acf_fields['internal_note']);
  return $acf_fields;
}, 10, 2);
```

## `blank_rest_site_data`
**Description:** Filter the site identity and menu data returned by the `/blank/v1/data` endpoint.

**Arguments:**
- `$data` *(array)*: The full data array containing `menus` and `identity`.

**Default props in `$data['identity']`:**
  - `name` (string)
  - `description` (string)
  - `url` (string)
  - `favicon` (string)
  - ...ACF options fields

**Example:**
```php
add_filter( 'blank_rest_site_data', function( array $data ): array {
  $data['identity']['custom_field'] = 'Custom Value';
  return $data;
}, 10, 1);
```

### `blank_rest_site_data_acf`

## `blank_rest_menus`
**Description:** Filter the menus array before it is returned by the REST API.

**Arguments:**
- `$flattened_menus` *(array)*: The associative array of menus by location.

**Example:**
```php
add_filter(' blank_rest_menus', function( array $menus ): array {
  // Add custom properties to menu items.
  foreach ($menus as $location => &$menu_items) {
    foreach ($menu_items as &$item) {
      $item['custom_icon'] = get_post_meta($item['id'], 'menu_icon', true);
    }
  }
  return $menus;
});
```

## `blank_rest_menu_item`
**Description:** Filter the properties of each menu item before it is returned in the REST API.

**Arguments:**
- `$blank_menu_item` *(array)*: The associative array of menu item data.
- `$wp_menu_item` *(WP_Post)*: The original menu item object.

**Default props in `$blank_menu_item`:**
  - `id` (int)
  - `title` (string)
  - `url` (string)
  - `type` (string)
  - `parent` (int)
  - `classes` (array)
  - `target` (string)
  - `attr_title` (string)

**Example:**
```php
add_filter('blank_rest_menu_item', function($blank_menu_item, $wp_menu_item) {
  $blank_menu_item['icon'] = get_post_meta($wp_menu_item->ID, 'icon', true);
  return $blank_menu_item;
}, 10, 2);
```

### `blank_rest_menu_item_acf`

WIP:
## `blank_redirect_url`
## `blank_show_admin_options_in_rest`
## `blank_theme_%admin_option_key%`
## `blank_use_multisite_options`
## `blank_rest_api_max_per_page`
## `blank_application_webhook_body_payload`