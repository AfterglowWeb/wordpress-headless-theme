# Blank – Headless WordPress Theme

Blank is a WordPress theme designed exclusively for headless usage. It acts as a secure and simplifier data layer for headless WordPress architectures. It integrates seamlessly with external front-end applications built with Next.js, React, Vue, or any other framework capable of consuming a REST API.

Blank can be configured to exposes flattened posts, attachments, menus, and site identity through custom REST API endpoints, protected by reinforced WordPress application authentication. It can also be configured to send data to your application via webhooks.

By default, Blank redirect all WordPress templates to a blank home page. It is then up to you to deploy the theme behind a bridge (such as a front-end application or proxy).

From the WordPress admin interface, you can configure the following options:

- Select post types to be flattened and exposed

- Restrict WordPress application credentials to a single user

- Rate-limit the WordPress application user

- Restrict and rate-limit front-facing wp/v2 endpoints

- Disable Gutenberg

- Disable comments

- Limit image file size

- Set up a webhook to send payloads to your front-end application

- Enable Advanced Custom Fields (ACF) support on flattened data (posts, terms, attachments, options page)

You can use JSON files located in ./config/custom_*.json to:

- Define custom post types

- Define custom taxonomies

- Define custom menus

To ensure that your configuration is preserved across Blank theme updates, you should create a child theme and add a config directory at its root, for example: `blank-child/config`
You can then copy the configuration files from the parent theme into this directory and customize them as needed.

A list of available filter hooks is provided below for further customization.
If you plan to extend this approach, it is recommended to create a child theme.

<details>
<summary>Requirements<summary>

- **WordPress:** 6.0 or higher
- **PHP:** 7.4 or higher

</details>

<details>
<summary>Getting Start<summary>

1. Download or clone this repository into your `wp-content/themes/` directory:
```bash
cd wp-content/themes/
git clone https://github.com/AfterglowWeb/wordpress-headless-theme.git blank
```

2. Activate the theme from WordPress admin panel

3. Create a child theme

4. Configure custom post types, taxonomies, and menus using JSON files in ``blank-child/config` directory (see Configuration section)

6. Go through the setup options in the theme admin page located at the bottom of the admin menu.

</details>

<details><summary>Authentication<summary>

The **3 custom REST API endpoints** are protected by a bearer token authentication using **WordPress Application Passwords**. You can setup application tokens on a user based logic in the user profiles.
By default, the theme validates the Bearer token against **User ID 1** (typically the site administrator) with `rest_api` as the password identifier. You can customize this using the `blank_rest_api_user_id` and the `blank_rest_api_password_name` filters (see Filters section).

### Setting up Bearer Token Authentication:

1. Go to **Users > Profile** in WordPress admin
2. Scroll to **Application Passwords** section
3. Create a new application password
4. **Important:** Copy the generated token 
5. Store it in your front-end `.env` file
   ```
   WORDPRESS_BEARER_TOKEN=abcd efg hijk lmnop
   ```
6. Use it in your API requests with pipe delimiter format: `Bearer|token`

```bash
curl -H "Authorization: Bearer|abcd efg hijk lmnop" \
     https://your-site.com/wp-json/blank/v1/data
```

</details>

<details>
<summary>REST API Endpoints<summary>

The theme provides **3 custom REST API endpoint**
  - `/blank/v1/data`
  - `/blank/v1/<post_type>`
  - `/blank/v1/<post_type>/images`

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

**Parameters:**
- `post_type` (string, required)

### GET /wp-json/blank/v1/{post_type}/images

**Description:**  
Returns a flat array of all image objects attached to post belonging to the `post_type` parameter.
All the published posts of a given post type will be explored for:
- WordPress featured image, 
- ACF image and gallery fields

This endpoint is intended to bulk serve images in a minimal and secured way so you can easyly launch async workers from a middelware to copy them in your application.
The images src are filtered out to remove wordpress domain and upload folder. Up to you to reconstruct your assets path inside your server application.
The image props are filtered out to keep: id, src, alt, width, height, mime_type

You can use the filter `blank_rest_image` to control wich image props you want to expose.
See Filters section.

**Parameters:**
- `post_type` (string, required)

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

</details>

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

## Available Filters (Hooks)

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

### `blank_rest_attachment`
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

## ChangeLog

### version 1.0.4

- Complete refacto

### version 1.0.3b

 - Added all front templates redirect to home_url() in cmk\blank\Theme::redirect_front_pages(), can be controlled through `blank_redirect_url`.
 - Added class cmk\blank\Cache to provide a webhook to flush application cache.
 - Added filters: `blank_application_host`, `blank_application_webhook_endpoint`
 - Added mandatory password identifier.

### version 1.0.2b

 - Added Composer support for autoloading and linting.
 - Fixed issue with copying language files using WP_Filesystem API.
 - Using '_wp_attached_file' meta key to get the relative src of the image.
 - Endpoint posts by <post_type> with bearer token and props filtering.
 
### version 1.0.1

 - Added filter on menu items 'blank_rest_menu_item' to allow modification of individual menu items before returning in REST API.
 - Added endpoint '/images/{post_type}' to fetch flattened list of images used in specified post type.
 - Changed filter name from 'cmk_blank_allowed_post_types' to 'blank_allowed_post_types' for consistency.
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
