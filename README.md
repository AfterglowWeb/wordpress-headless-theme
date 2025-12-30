# Blank Headless WordPress Theme

A minimal WordPress theme designed exclusively for **headless CMS** usage with external front-end applications like Next.js, React, Vue, or any other framework capable of consuming a REST API.

## Purpose

This theme is **not intended for traditional WordPress front-end rendering**. It serves as a secure data layer for headless architectures, providing:

- Custom REST API endpoints with Bearer token authentication
- Advanced Custom Fields (ACF) integration (optional)
- Custom post types and taxonomies management via JSON configuration
- Custom menus via JSON configuration
- Clean, minimal codebase with no front-end assets

## Requirements

- **WordPress:** 6.0 or higher
- **PHP:** 7.4 or higher

## Installation

1. Download or clone this repository into your `wp-content/themes/` directory:
```bash
cd wp-content/themes/
git clone https://github.com/AfterglowWeb/wordpress-headless-theme.git blank
```

2. Activate the theme from WordPress admin panel

3. Configure custom post types, taxonomies, and menus using JSON files in `/config` directory (see Configuration section)

## REST API Endpoints

The theme provides **3 custom REST API endpoint**
  - `/blank/v1/data`
  - `/blank/v1/<post_type>`
  - `/blank/v1/<post_type>/images`

## Authentication

The **3 custom REST API endpoints** are protected by a bearer token authentication using **WordPress Application Passwords**. You can setup application tokens on a user based logic in the user profiles.
By default, the theme validates the Bearer token against **User ID 1** (typically the site administrator) with `rest_api` as the password identifier. You can customize this using the `blank_rest_api_user_id` and the `blank_rest_api_password_key` filters (see Filters section).

### Setting up Bearer Token Authentication:

1. Go to **Users > Profile** in WordPress admin
2. Scroll to **Application Passwords** section
3. Create a new application password
4. **Important:** Copy the generated password and **remove ALL spaces** before using it
   - WordPress generates: `abcd efgh ijkl mnop`
   - You must use: `abcdefghijklmnop`
5. Store it in your front-end `.env` file (without spaces):
   ```
   WORDPRESS_BEARER_TOKEN=abcdefghijklmnop
   ```
6. Use it in your API requests with pipe delimiter format:

```bash
curl -H "Authorization: Bearer|abcdefghijklmnop" \
     https://your-site.com/wp-json/blank/v1/data
```

**Token Format:** `Bearer|token` (pipe delimiter, no spaces in token)


### GET /wp-json/blank/v1/data

Retrieves site identity data and menu items.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "menus": {
    "main_menu": [...],
    "footer_menu": [...]
  },
  "identity": {
    "name": "Site Name",
    "description": "Site Description",
    "url": "https://your-site.com",
    "favicon": "https://your-site.com/favicon.ico",
    {..."acf_fields"}
  }
}
```

### GET /wp-json/blank/v1/{post_type}

**Description:**  
Returns a flat array of all post objects belonging to the `post_type` parameter.
This endpoint is intended to bulk serve Wordpress posts in a minimal and secured way so you can easyly launch async workers from a middelware to import json objects in your application.

*! It does not handle requests number limiting.*
Your may want to handle this aspect yourself in your child theme or directly in your server configuration.

**Authentication:**  
Requires Bearer token (see above).

**Parameters:**
- `post_type` (string, required): The slug of the WordPress post type (e.g. `portfolio`, `post`, `page`). Must be 2–20 characters, only letters, numbers, underscores, or hyphens.

### GET /wp-json/blank/v1/{post_type}/images

**Description:**  
Returns a flat array of all image objects attached to post belonging to the `post_type` parameter.
all published posts of a given post type will be explored for:
- WordPress featured image, 
- ACF image and gallery fields

This endpoint is intended to bulk serve images in a minimal and secured way so you can easyly launch async workers from a middelware to copy them in your application.

*! It does not handle requests number limiting.*
*! It does not hide images from default Wordpress endpoints.*
Your may want to handle these aspects yourself.

The images src are filtered out to remove wordpress domain and upload folder. Up to you to reconstruct your assets path inside your server application.
The image props are filtered out to keep the minimal: id, src, alt, width, height, mime_type

You can use the filter `blank_allowed_post_types_bulk_images` to control wich post_type images to expose.
You can use the filter `blank_rest_image` to control wich image props you want to expose.
See Filters section.

**Authentication:**  
Requires Bearer token (see above).

**Parameters:**
- `post_type` (string, required): The slug of the WordPress post type (e.g. `portfolio`, `post`, `page`). Must be 2–20 characters, only letters, numbers, underscores, or hyphens.

**Example Request:**

```http
GET /wp-json/blank/v1/images/portfolio
Authorization: Bearer|yourtoken
```

**Response**
```
[
  {
    "id": 123,
    "src": "2025/01/image.jpg",
    "alt": "Image alt text",
    "width": 1200,
    "height": 800,
    "mime_type": "image/jpeg",
    "post_id": 122,
    "field_key": "featured_image"
  },
  ...
]
```

### Standard WordPress REST API
Standard WordPress REST API endpoints (`/wp/v2/*`) remain publicly accessible.

## Post Types, Menus and Taxonomies Configuration

### Custom Post Types

Define custom post types in `config/custom_posts.json`:

```json
{
  "custom_posts": [
    {
      "slug": "portfolio",
      "singular_name": "Portfolio Item",
      "plural_name": "Portfolio Items",
      "public": true,
      "show_in_rest": true,
      "supports": ["title", "editor", "thumbnail", "excerpt"]
    }
  ]
}
```

### Custom Menus

Define navigation menus in `config/custom_menus.json`:

```json
{
  "custom_menus": [
    {
      "slug": "main-menu",
      "name": "Main Menu"
    },
    {
      "slug": "footer-menu",
      "name": "Footer Menu"
    }
  ]
}
```

### Custom Taxonomies

Define taxonomies in `config/custom_taxonomies.json`:

```json
{
  "custom_taxonomies": [
    {
      "slug": "portfolio-category",
      "singular_name": "Portfolio Category",
      "plural_name": "Portfolio Categories",
      "post_types": ["portfolio"]
    }
  ]
}
```

## ACF (Advanced Custom Fields) Plugin Integration

By default, the site identity data (`/blank/v1/data` endpoint) includes:
- Basic WordPress site info (name, description, URL, favicon)
- Any additional data added via the `blank_rest_site_identity` filter
- **If ACF is installed:** All fields from the ACF Options Page (using `get_fields('options')`)

The theme automatically:
   - Saves ACF field groups as JSON in `/config` directory
   - Loads field groups from `/config` directory

## Disable Comments

By default, the theme disables comments support through posts and and comments admin screens. You can enable theme by using the filter `blank_disable_comments`.

## Available Filters (Hooks)

Below are all the filters (hooks) available in this theme's REST API extension, with their arguments and expected usage. All filters follow WordPress best practices for extensibility and security.

### `blank_rest_post`
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

### `blank_rest_term`
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

### `blank_rest_site_data`
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
add_filter('blank_rest_site_data', function( array $data ): array {
  $data['identity']['custom_field'] = 'Custom Value';
  return $data;
}, 10, 1);
```

### `blank_rest_menus`
**Description:** Filter the menus array before it is returned by the REST API.

**Arguments:**
- `$flattened_menus` *(array)*: The associative array of menus by location.

**Example:**
```php
add_filter('blank_rest_menus', function( array $menus ): array {
  // Add custom properties to menu items
  foreach ($menus as $location => &$menu_items) {
    foreach ($menu_items as &$item) {
      $item['custom_icon'] = get_post_meta($item['id'], 'menu_icon', true);
    }
  }
  return $menus;
});
```

### `blank_rest_menu_item`
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

### `blank_rest_image`
**Description:** Filter the properties of each image returned by the `/blank/v1/images/<post_type>` endpoint.

**Arguments:**
- `$filtered_image` *(array)*: The associative array of image data.
- `$img_id` *(int)*: The image attachment ID.

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
add_filter('blank_rest_image', function($filtered_image, $img_id) {
  $filtered_image['custom_prop'] = 'value';
  return $filtered_image;
}, 10, 2);
```

### `blank_allowed_post_types_bulk_images`
**Description:** Filter the allowed post types for the `/blank/v1/images/<post_type>` endpoint.

**Arguments:**
- `$post_types` *(array)*: The allowed post type slugs.

**Example:**
```php
add_filter('blank_allowed_post_types_bulk_images', function($post_types) {
  $post_types[] = 'my_custom_type';
  return $post_types;
}, 10, 1);
```

### `blank_rest_api_user_id`
**Description:** Filter the user ID used for bearer token authentication.

**Arguments:**
- `$user_id` *(int)*: The user ID to validate the token against.

**Example:**
```php
add_filter('blank_rest_api_user_id', function($user_id): int {
  return 2; // Use User ID 2 instead of 1
}, 10, 1);
```

### `blank_rest_api_password_key`
**Description:**  Setup the password name you previously registered in the user profile for bearer token authentication.

**Arguments:**
- `$password_key` *(string)*: The name of the password containing the token used on the REST API.

**Example:**
```php
add_filter('blank_rest_api_password_key', function( string $password_key ): string {
  return 'my_password';
}, 10, 1);
```

### `blank_application_user_id`
**Description:** Filter the user ID used to trigger your application webhook.

**Arguments:**
- `$user_id` *(int)*: The user ID to validate the token against.

**Example:**
```php
add_filter('blank_application_user_id', function($user_id): int {
  return 2; // Use User ID 2 instead of 1
}, 10, 1);
```

### `blank_application_password_key`
**Description:**  Setup the password name you previously registered in the user profile for your application webhook.

**Arguments:**
- `$password_key` *(string)*: The name of the password containing the token to send to your application webhook.

**Example:**
```php
add_filter('blank_application_password_key', function( string $password_key ): string {
  return 'my_password';
}, 10, 1);
```

### `blank_application_host`
**Description:**  Setup your application host

**Arguments:**
- `$host` *(string)*: Your application host with protocol and no trailing slash.

**Example:**
```php
add_filter('blank_application_host', function( string $host ): string {
  return 'https://www.my-host.com';
}, 10, 1);
```

### `blank_application_cache_route`
**Description:**  Setup your application cache route.

**Arguments:**
- `$route` *(string)*: Your application route used to trigger cache flushing.

**Example:**
```php
add_filter('blank_application_cache_route', function( string $route ): string {
  return '/api/flush-cache';
}, 10, 1);
```

### `blank_disable_comments`
**Description:** Enable or disable WordPress comments support (default: disabled).

**Arguments:**
- `$disable` *(bool)*: Whether to disable comments (default: true).

**Example:**
```php
add_filter('blank_disable_comments', function($disable): bool {
  return false; // Enable comments
}, 10, 1);
```

**Security Note:** When using filters, always sanitize and validate data. Never expose sensitive information like passwords, API keys, or private user data.

## ChangeLog

### version 1.0.3b

 - Added class cmk\blank\Cache to provide a webhook to flush application cache.
 - Added mandatory password identifier.
 - Added filters: `blank_application_host`, `blank_application_cache_route`, `blank_application_user_id`, `blank_application_password_key`

### version 1.0.2b

 - Added Composer support for autoloading and linting.
 - Fixed issue with copying language files using WP_Filesystem API.
 - Using '_wp_attached_file' meta key to get the relative src of the image.
 - Endpoint posts by <post_type> with bearer token and props filtering.
 
### version 1.0.1

 - Added filter on menu items 'blank_rest_menu_item' to allow modification of individual menu items before returning in REST API.
 - Added endpoint '/images/{post_type}' to fetch flattened list of images used in specified post type.
 - Changed filter name from 'cmk_blank_allowed_post_types' to 'blank_allowed_post_types_bulk_images' for consistency.
 - Added filter 'blank_rest_image' to allow modification of image properties before returning in REST API.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Credits

Developed by [Cédric Moris Kelly](https://www.moris-kelly.com)

## License

This theme is licensed under the **GNU General Public License v2 or later**.

See [LICENSE](http://www.gnu.org/licenses/gpl-2.0.html) for more details.


## Related Resources

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WordPress Application Passwords](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/)
