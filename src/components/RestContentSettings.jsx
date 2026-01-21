import { useEffect } from '@wordpress/element';
import { useAdminData } from '../contexts/AdminDataContext';
import useSettingsForm from '../contexts/useSettingsForm';

import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function RestContentSettings({}) {
	const { adminData, updateAdminData } = useAdminData();
	const { __ } = wp.i18n || {};

	const {
		form,
		setField,
	} = useSettingsForm({
		adminData,
		updateAdminData,
		action: 'blank_theme_update_options',
	});


	return (
	
	<Stack spacing={3}>

		<Typography variant="h6" sx={{fontWeight:600}}>
			{__('REST Content', 'blank')}
		</Typography>

		<FormControl>
			<FormControlLabel
				control={
					<Switch
						checked={!!form.blank_use_core_rest_enabled}
						name="blank_use_core_rest_enabled"
						onChange={setField}
					/>
				}
				label={__('Do not use Blank Theme REST Models', 'blank')}

			/>
			<FormHelperText>{__('Use standard WordPress REST models. Deactivate Blank Theme REST models.', 'blank')}</FormHelperText>
		</FormControl>

		<FormControl>
			<FormControlLabel
				control={
					<Switch
						checked={!!form.blank_relative_url_enabled}
						name="blank_relative_url_enabled"
						onChange={setField}
					/>
				}
				label={__('Relative urls', 'blank')}

			/>
			<FormHelperText>{__('Remove protocol and domain from post and term urls (http[s]://www.domain-example.com).', 'blank')}</FormHelperText>
		</FormControl>

		<FormControl>
			<FormControlLabel
				control={
					<Switch
						checked={!!form.blank_embed_featured_attachment_enabled}
						name="blank_embed_featured_attachment_enabled"
						onChange={setField}
					/>
				}
				label={__('Embed featured attachment on posts', 'blank')}
			/>
			<FormHelperText>{__('Replace featured attachment id by a simplified attachment object.', 'blank' )}</FormHelperText>
		</FormControl>

		<FormControl>
			<FormControlLabel
				control={
					<Switch
						checked={!!form.blank_embed_post_attachments_enabled}
						name="blank_embed_post_attachments_enabled"
						onChange={setField}
					/>
				}
				label={__('Embed attachments on posts', 'blank')}
			/>
			<FormHelperText>{__('Add an array of simplified attachments on posts. The data source are: post featured attachment, post ACF fields based on their types.', 'blank')}</FormHelperText>
		</FormControl>

		<FormControl>
			<FormControlLabel
				control={
					<Switch
						checked={!!form.blank_relative_attachment_url_enabled}
						name="blank_relative_attachment_url_enabled"
						onChange={setField}
					/>
				}
				label={__('Relative attachment urls', 'blank')}
			/>
			<FormHelperText>{__('Remove domain and uploads path from attachments url (www.domain-example.com/wp-content/uploads).', 'blank')}</FormHelperText>
		</FormControl>

		<FormControl>
			<FormControlLabel
				control={
					<Switch
						checked={!!form.blank_embed_terms_enabled}
						name="blank_embed_terms_enabled"
						onChange={setField}
					/>
				}
				label={__('Embed terms', 'blank')}
			/>
			<FormHelperText>{__('Relative terms ids by simplified term objects', 'blank')}</FormHelperText>
		</FormControl>

		<FormControl>
			<FormControlLabel
				control={
					<Switch
						checked={!!form.blank_with_acf_enabled}
						name="blank_with_acf_enabled"
						onChange={setField}
					/>
				}
				label={__('Enable ACF Support', 'blank')}
			/>
			<FormHelperText>{__('Embed ACF Fields on simplified post and terms objects', 'blank')}</FormHelperText>
		</FormControl>

	</Stack>

	);
}
