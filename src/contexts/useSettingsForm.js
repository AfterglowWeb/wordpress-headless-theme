import { useState, useEffect, useCallback } from '@wordpress/element';

export default function useSettingsForm({
	adminData,
	updateAdminData,
	action,
}) {
	const [adminOptions, setAdminOptions] = useState({});
	const [form, setForm] = useState({
		blank_protect_wp_rest_routes: false,
		blank_allowed_post_types: [],
		blank_disable_gutenberg: false,
		blank_disable_comments: false,
		blank_enable_acf_support: true,
		rest_api_user_id: '',
		rest_api_rate_limit: 30,
		rest_api_rate_limit_time: 60,
		rest_api_posts_per_page: 100,
		application_host: '',
		application_webhook_endpoint: '',
		application_webhook_secret_generated: false,
		max_upload_size: 1024,
		enable_max_upload_size: false,
	});

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [justSaved, setJustSaved] = useState(false);

	useEffect(() => {
		if (!adminData?.admin_options) return;
		setAdminOptions(adminData.admin_options);
	}, [adminData]);

	useEffect(() => {
		if (!adminOptions) return;

		setForm({
			blank_protect_wp_rest_routes: Boolean(adminOptions.blank_protect_wp_rest_routes),
			blank_allowed_post_types: Array.isArray(adminOptions.blank_allowed_post_types)
				? adminOptions.blank_allowed_post_types
				: [],
			blank_disable_gutenberg: Boolean(adminOptions.blank_disable_gutenberg),
			blank_disable_comments: Boolean(adminOptions.blank_disable_comments),
			blank_enable_acf_support: Boolean(adminOptions.blank_enable_acf_support),
			rest_api_user_id: adminOptions.rest_api_user_id ?? '',
			rest_api_rate_limit: Number(adminOptions.rest_api_rate_limit ?? 30),
			rest_api_rate_limit_time: Number(adminOptions.rest_api_rate_limit_time ?? 60),
			rest_api_posts_per_page: Number(adminOptions.rest_api_posts_per_page ?? 100),
			application_host: adminOptions.application_host ?? '',
			application_webhook_endpoint: adminOptions.application_webhook_endpoint ?? '',
			application_webhook_secret_generated: Boolean(adminOptions.application_webhook_secret_generated),
			max_upload_size: Number(adminOptions.max_upload_size ?? 1024),
			enable_max_upload_size: Boolean(adminOptions.enable_max_upload_size),
		});
	}, [adminOptions]);


	const setField = useCallback((eventOrName, maybeValue) => {
		if (eventOrName?.target) {
			const { name, value, type, checked } = eventOrName.target;
			if (!name) return;

			setForm((prev) => ({
				...prev,
				[name]: type === 'checkbox' ? Boolean(checked) : value,
			}));
			return;
		}

		if (typeof eventOrName === 'string') {
			setForm((prev) => ({
				...prev,
				[eventOrName]: maybeValue,
			}));
		}
	}, []);


	const setSlider = useCallback((name, value) => {
		const numericValue = Array.isArray(value)
			? Number(value[0])
			: Number(value);

		setForm((prev) => ({
			...prev,
			[name]: Number.isFinite(numericValue) ? numericValue : 0,
		}));
	}, []);

	const mapFormToAdminOptions = useCallback((form) => ({
		blank_protect_wp_rest_routes: form.blank_protect_wp_rest_routes,
		blank_allowed_post_types: form.blank_allowed_post_types,
		blank_disable_gutenberg: form.blank_disable_gutenberg,
		blank_disable_comments: form.blank_disable_comments,
		blank_enable_acf_support: form.blank_enable_acf_support,
		rest_api_user_id: form.rest_api_user_id,
		rest_api_rate_limit: form.rest_api_rate_limit,
		rest_api_rate_limit_time: form.rest_api_rate_limit_time,
		rest_api_posts_per_page: form.rest_api_posts_per_page,
		application_host: form.application_host,
		application_webhook_endpoint: form.application_webhook_endpoint,
		application_webhook_secret_generated: form.application_webhook_secret_generated,
		max_upload_size: form.max_upload_size,
		enable_max_upload_size: form.enable_max_upload_size,
	}), []);

	const submit = useCallback(async () => {
		if (!adminData?.nonce || !adminData?.ajaxurl) {
			throw new Error('Missing AJAX configuration');
		}

		setSaving(true);

		const response = await fetch(adminData.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: new URLSearchParams({
				action,
				nonce: adminData.nonce,
				options: JSON.stringify(form),
			}),
		});

		const data = await response.json();

		if (!data.success) {
			setSaving(false);
			throw new Error(data.data?.error || 'Unknown error');
		}

		updateAdminData({
			admin_options: {
				...adminOptions,
				...mapFormToAdminOptions(form),
			},
		});

		setJustSaved(true);
		setTimeout(() => setJustSaved(false), 1200);
		setSaving(false);
	}, [adminData, form, updateAdminData, adminOptions, mapFormToAdminOptions, action]);

	return {
		form,
		setField,
		setSlider,
		submit,
		confirmOpen,
		openConfirm: () => setConfirmOpen(true),
		closeConfirm: () => setConfirmOpen(false),
		saving,
		justSaved,
	};
}
