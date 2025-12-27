# Blank Headless WordPress Theme

A minimal WordPress theme designed exclusively for **headless CMS** usage with external front-end applications like Next.js, React, Vue, or any other framework capable of consuming a REST API.

## Purpose

This theme is **not intended for traditional WordPress front-end rendering**. It serves as a secure data layer for headless architectures, providing:

- Custom REST API endpoint with Bearer token authentication
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

## Authentication

The theme provides **2 custom REST API endpoint**
  - `/blank/v1/data`
  - `/blank/v1/images/<post_type>`

protected by Bearer token authentication using **WordPress Application Passwords**. 
By default, the theme validates the Bearer token against **User ID 1** (typically the site administrator). You can customize this using the `blank_rest_api_user_id` filter (see Filters section).

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

## REST API Endpoint

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

### GET /wp-json/blank/v1/images/{post_type}

**Description:**  
Returns a flat array of image objects attached to post belonging to the `post_type` parameter.
all published posts of a given post type will be explored for:
- WordPress featured image, 
- ACF image and gallery fields

This endpoint is intended to bulk serve images in a minimal and secured way so you can easyly launch async workers from a middelware to copy them in your application.

*! It does not handle limiting.*
*! It does not hide images from default Wordpress endpoints.*
Your may want to handle these aspects yourself.

The images src are filtered out to remove wordpress domain and upload folder. Up to you to reconstruct your assets path inside your server application.
The image props are filtered out to keep the minimal: id, src, alt, width, height, mime_type

You can use the filter `blank_allowed_post_types_bulk_images` to control wich post_type images to expose.
You can use the filter `blank_rest_image_props` to control wich image props you want to expose.
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
  },
  ...
]
```
[
  {
    "id": 123,
    "src": "2025/01/image.jpg",
    "alt": "Image alt text",
    "width": 1200,
    "height": 800,
    "mime_type": "image/jpeg",
  },
  ...
]
```

### Standard WordPress REST API
Standard WordPress REST API endpoints (`/wp/v2/*`) remain publicly accessible.

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

## Available Filters

### `blank_rest_site_identity`

Modify site identity data before it's returned by the REST API:

```php
add_filter('blank_rest_site_identity', function($identity_data) {
    $identity_data['custom_field'] = 'Custom Value';
    $identity_data['contact'] = [
        'email' => 'contact@example.com',
        'phone' => '+1234567890'
    ];
    return $identity_data;
});
```

### `blank_rest_menus`

Modify menu data before it's returned by the REST API:

```php
add_filter('blank_rest_menus', function($menus) {
    // Add custom properties to menu items
    foreach ($menus as $location => &$menu_items) {
        foreach ($menu_items as &$item) {
            $item['custom_icon'] = get_post_meta($item['id'], 'menu_icon', true);
        }
    }
    return $menus;
});
```

### `blank_rest_api_user_id`

Change which user's Application Passwords are validated for Bearer token authentication. By default, the theme uses User ID 1.

```php
// Use a different user for token validation
add_filter('blank_rest_api_user_id', function($user_id) {
    return 2; // Use User ID 2 instead
});
```

**Security Note:** When using filters, always sanitize and validate data. Never expose sensitive information like passwords, API keys, or private user data.


### `blank_disable_comments`

Toggle Wordpress comments support.

```php
// Enable comments, by default comments are removed from the admin.
add_filter('blank_disable_comments', function(true) {
  return false;
}, 10, 1);
```
### `blank_rest_menu_item`

Filter the menu items props exposed in the `/wp-json/blank/v1/data` endpoint

```php
add_filter('blank_rest_menu_item', function($blank_menu_item, $wp_menu_item) {
    return [
      'id' => (int) sanitize_text_field( $wp_menu_item->ID ),
      'title' => (string) sanitize_text_field( $item->title ),
			'url'      => (string) esc_url( $item->url ),
      //...
    ]
}, 10, 2);
```

### `blank_allowed_post_types_bulk_images`

Filter the images exposed in the `/wp-json/blank/v1/images/<post_type>` endpoint by the post types they are attached to.

```php
add_filter('blank_allowed_post_types_bulk_images', function($post_types) {
  return (array) ['my_post_type'];
});

```
### `blank_rest_image_props`

```php
//Return full src
add_filter('blank_rest_image_props', function($filtered_image, $img_id) {
   return wp_get_attachment_url($img_id);
}, 10, 2);

```

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
