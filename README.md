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

The theme provides **one custom REST API endpoint** (`/blank/v1/data`) protected by Bearer token authentication using **WordPress Application Passwords**. Standard WordPress REST API endpoints (`/wp/v2/*`) remain publicly accessible.

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

Retrieves site identity data and menu configurations.

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
    "favicon": "https://your-site.com/favicon.ico"
  }
}
```

### Standard WordPress REST API

All standard WordPress REST endpoints remain available **without authentication**:
- `/wp-json/wp/v2/posts`
- `/wp-json/wp/v2/pages`
- `/wp-json/wp/v2/media`
- `/wp-json/wp/v2/{custom-post-type}`

## Project Structure

```
blank/
├── config/                    # ACF field groups and configurations (git-ignored)
│   ├── custom_menus.json
│   ├── custom_posts.json
│   └── custom_taxonomies.json
├── inc/                       # Theme classes
│   ├── Acf.php               # ACF configuration
│   ├── CustomPosts.php       # Custom post types and taxonomies
│   ├── DisableComments.php   # Disable WordPress comments
│   ├── RestExtend.php        # REST API extensions and authentication
│   └── Theme.php             # Core theme setup
├── functions.php             # Theme initialization
├── index.php                 # Minimal template (headless usage only)
├── style.css                 # Theme metadata
├── .gitignore
└── README.md
```

## Configuration

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

## Advanced Custom Fields Integration (Optional)

ACF is **optional** but recommended for managing custom fields easily through the WordPress admin interface.

### Default Behavior

By default, the site identity data (`/blank/v1/data` endpoint) includes:
- Basic WordPress site info (name, description, URL, favicon)
- **If ACF is installed:** All fields from the ACF Options Page (using `get_fields('options')`)
- Any additional data added via the `blank_rest_site_identity` filter

### Using ACF

1. Install and activate Advanced Custom Fields plugin

2. Create an ACF Options Page in your `functions.php`:

```php
if (function_exists('acf_add_options_page')) {
    acf_add_options_page([
        'page_title' => 'Site Identity',
        'menu_title' => 'Site Identity',
        'menu_slug'  => 'site-identity',
        'capability' => 'edit_posts',
    ]);
}
```

3. Create field groups in ACF admin and assign them to the Options Page

4. The theme automatically:
   - Saves ACF field groups as JSON in `/config` directory
   - Loads field groups from `/config` directory
   - Exposes all Options Page fields through `/blank/v1/data` endpoint
## Filters

The theme provides filters to extend functionality without modifying core files.

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