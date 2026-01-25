import { useState, useEffect, useCallback } from '@wordpress/element';

export default function useSettingsForm( {
	adminData,
	updateAdminData,
	action,
} ) {
	const [ adminOptions, setAdminOptions ] = useState( {} );
	const [ form, setForm ] = useState( {
		blank_use_core_rest_enabled: false,
		blank_relative_url_enabled: false,
		blank_embed_featured_attachment_enabled: false,
		blank_embed_post_attachments_enabled: false,
		blank_relative_attachment_url_enabled: false,
		blank_embed_terms_enabled: false,
		blank_embed_authors_enabled: false,
		blank_with_acf_enabled: false,

		rest_api_posts_per_page: 100,
		rest_api_attachments_per_page: 100,
		rest_api_restrict_post_types_enabled: false,
		rest_api_allowed_post_types: [],
		rest_api_enforce_auth: false,
		rest_api_user_id: '',
		rest_api_rate_limit: 30,
		rest_api_rate_limit_time: 60,

		application_host: '',
		application_webhook_endpoint: '',

		core_disable_gutenberg_enabled: false,
		core_disable_comments_enabled: false,
		core_max_upload_size: 1024,
		core_max_upload_size_enabled: false,
	} );

	useEffect( () => {
		if ( ! adminData?.admin_options ) {
			return;
		}
		setAdminOptions( adminData.admin_options );
	}, [ adminData ] );

	useEffect( () => {
		if ( ! adminOptions ) {
			return;
		}

		setForm( {
			blank_use_core_rest_enabled: Boolean(
				adminOptions.blank_use_core_rest_enabled
			),
			blank_embed_featured_attachment_enabled: Boolean(
				adminOptions.blank_embed_featured_attachment_enabled
			),
			blank_embed_authors_enabled: Boolean(
				adminOptions.blank_embed_authors_enabled
			),
			blank_relative_url_enabled: Boolean(
				adminOptions.blank_relative_url_enabled
			),
			blank_embed_post_attachments_enabled: Boolean(
				adminOptions.blank_embed_post_attachments_enabled
			),
			blank_relative_attachment_url_enabled: Boolean(
				adminOptions.blank_relative_attachment_url_enabled
			),
			blank_embed_terms_enabled: Boolean(
				adminOptions.blank_embed_terms_enabled
			),
			blank_with_acf_enabled: Boolean(
				adminOptions.blank_with_acf_enabled
			),

			rest_api_enforce_auth: Boolean(
				adminOptions.rest_api_enforce_auth
			),
			rest_api_allowed_post_types: Array.isArray(
				adminOptions.rest_api_allowed_post_types
			)
				? adminOptions.rest_api_allowed_post_types
				: [],
			rest_api_user_id: adminOptions.rest_api_user_id ?? '',
			rest_api_rate_limit: Number(
				adminOptions.rest_api_rate_limit ?? 30
			),
			rest_api_rate_limit_time: Number(
				adminOptions.rest_api_rate_limit_time ?? 60
			),
			rest_api_posts_per_page: Number(
				adminOptions.rest_api_posts_per_page ?? 100
			),
			rest_api_attachments_per_page: Number(
				adminOptions.rest_api_attachments_per_page ?? 100
			),
			rest_api_restrict_post_types_enabled: Boolean(
				adminOptions.rest_api_restrict_post_types_enabled
			),

			application_host: adminOptions.application_host ?? '',
			application_webhook_endpoint:
				adminOptions.application_webhook_endpoint ?? '',

			core_disable_gutenberg_enabled: Boolean(
				adminOptions.core_disable_gutenberg_enabled
			),
			core_disable_comments_enabled: Boolean(
				adminOptions.core_disable_comments_enabled
			),
			core_max_upload_size: Number(
				adminOptions.core_max_upload_size ?? 1024
			),
			core_max_upload_size_enabled: Boolean(
				adminOptions.core_max_upload_size_enabled
			),
		} );
	}, [ adminOptions ] );

	const setField = useCallback( ( eventOrName, maybeValue ) => {
		if ( eventOrName?.target ) {
			const { name, value, type, checked } = eventOrName.target;
			if ( ! name ) {
				return;
			}

			setForm( ( prev ) => ( {
				...prev,
				[ name ]: type === 'checkbox' ? Boolean( checked ) : value,
			} ) );
			return;
		}

		if ( typeof eventOrName === 'string' ) {
			setForm( ( prev ) => ( {
				...prev,
				[ eventOrName ]: maybeValue,
			} ) );
		}
	}, [] );

	const setSlider = useCallback( ( name, value ) => {
		const numericValue = Array.isArray( value )
			? Number( value[ 0 ] )
			: Number( value );

		setForm( ( prev ) => ( {
			...prev,
			[ name ]: Number.isFinite( numericValue ) ? numericValue : 0,
		} ) );
	}, [] );

	const mapFormToAdminOptions = useCallback(
		( formData ) => ( {
			blank_use_core_rest_enabled: formData.blank_use_core_rest_enabled,
			blank_embed_featured_attachment_enabled:
				formData.blank_embed_featured_attachment_enabled,
			blank_relative_url_enabled: formData.blank_relative_url_enabled,
			blank_embed_post_attachments_enabled:
				formData.blank_embed_post_attachments_enabled,
			blank_relative_attachment_url_enabled:
				formData.blank_relative_attachment_url_enabled,
			blank_embed_terms_enabled: formData.blank_embed_terms_enabled,
			blank_embed_authors_enabled: formData.blank_embed_authors_enabled,
			blank_with_acf_enabled: formData.blank_with_acf_enabled,

			rest_api_enforce_auth:
				formData.rest_api_enforce_auth,
			rest_api_allowed_post_types: formData.rest_api_allowed_post_types,
			rest_api_restrict_post_types_enabled:
				formData.rest_api_restrict_post_types_enabled,
			rest_api_user_id: formData.rest_api_user_id,
			rest_api_rate_limit: formData.rest_api_rate_limit,
			rest_api_rate_limit_time: formData.rest_api_rate_limit_time,
			rest_api_posts_per_page: formData.rest_api_posts_per_page,
			rest_api_attachments_per_page: formData.rest_api_attachments_per_page,

			application_host: formData.application_host,
			application_webhook_endpoint: formData.application_webhook_endpoint,

			core_max_upload_size: formData.core_max_upload_size,
			core_max_upload_size_enabled: formData.core_max_upload_size_enabled,
			core_disable_gutenberg_enabled: formData.core_disable_gutenberg_enabled,
			core_disable_comments_enabled: formData.core_disable_comments_enabled,
		} ),
		[]
	);

	const submit = useCallback( async () => {
		if ( ! adminData?.nonce || ! adminData?.ajaxurl ) {
			throw new Error( 'Missing AJAX configuration' );
		}

		const response = await fetch( adminData.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: new URLSearchParams( {
				action,
				nonce: adminData.nonce,
				options: JSON.stringify( form ),
			} ),
		} );

		const data = await response.json();

		if ( ! data.success ) {
			throw new Error( data.data?.error || 'Unknown error' );
		}

		updateAdminData( {
			admin_options: {
				...adminOptions,
				...mapFormToAdminOptions( form ),
			},
		} );
	}, [
		adminData,
		form,
		updateAdminData,
		adminOptions,
		mapFormToAdminOptions,
		action,
	] );

	return {
		form,
		setField,
		setSlider,
		submit,
	};
}
