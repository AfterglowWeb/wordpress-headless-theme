import { useState, useEffect } from '@wordpress/element';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function RestApiSettings( {
	form,
	setField,
	users,
	restApiUser,
	postTypes,
} ) {
	const { __ } = wp.i18n || {};

	return (
		<Stack spacing={ 3 }>
			<Typography variant="h6" sx={ { fontWeight: 600 } }>
				{ __( 'REST API Settings', 'blank' ) }
			</Typography>

			<FormControl>
				<FormControlLabel
					control={
						<Switch
							checked={
								!! form.rest_api_restrict_post_types_enabled
							}
							name="rest_api_restrict_post_types_enabled"
							onChange={ setField }
						/>
					}
					label={ __(
						'Enable Exposed Posts Types Restict',
						'blank'
					) }
				/>
				<FormHelperText>
					{ __(
						'This will enable post type exposition settings accross WordPress REST API and Blank REST API.',
						'blank'
					) }
				</FormHelperText>
			</FormControl>

			<Box sx={ { minWidth: 120 } }>
				{ postTypes && (
					<MultipleSelect
						name="rest_api_allowed_post_types"
						label={ __( 'Exposed Post Types', 'blank' ) }
						value={ form.rest_api_allowed_post_types }
						helperText={
							'Exposed post types in the REST API. If empty, the default show_in_rest post_type options are applied'
						}
						options={ postTypes }
						onChange={ setField }
					/>
				) }
			</Box>

			<TextField
				label={ __( 'Posts Per Page', 'blank' ) }
				type="number"
				min="0"
				max="1000"
				helperText={ __(
					'This applies to REST collections only, the number of posts per page in Settings > Reading is not modified.',
					'blank'
				) }
				name="rest_api_posts_per_page"
				value={ form.rest_api_posts_per_page }
				onChange={ setField }
				fullWidth
			/>

			<TextField
				label={ __( 'Attachments Per Page', 'blank' ) }
				type="number"
				min="0"
				max="1000"
				helperText={ __(
					'This applies to the Blank REST attachments endpoint.',
					'blank'
				) }
				name="rest_api_attachments_per_page"
				value={ form.rest_api_attachments_per_page }
				onChange={ setField }
				fullWidth
			/>

			<Box sx={ { minWidth: 120 } }>
				<SimpleSelect
					name="rest_api_user_id"
					label={ __( 'Rest API User', 'blank' ) }
					helperText={ __(
						'Restrict REST API access to a specific application user.',
						'blank'
					) }
					value={ form.rest_api_user_id }
					options={ users }
					defaultLabel={ {
						value: 0,
						label: __( 'Select User', 'blank' ),
					} }
					onChange={ setField }
				/>

				{ form.rest_api_user_id &&
				restApiUser &&
				restApiUser?.admin_url ? (
					<Typography
						component="a"
						href={ restApiUser.admin_url }
						variant="body.2"
						target="_blank"
						sx={ {
							display: 'flex',
							alignItems: 'center',
							gap: '4px',
							px: '14px',
							fontSize: '12px',
						} }
					>
						{ __( 'User profile', 'blank' ) }
						<OpenInNewIcon fontSize="inherut" />
					</Typography>
				) : null }
			</Box>

			<TextField
				label={ __( 'Rate Limit Requests', 'blank' ) }
				type="number"
				helperText={ __(
					'The maximum number of REST API requests a user can make before being rate-limited.',
					'blank'
				) }
				name="rest_api_rate_limit"
				value={ form.rest_api_rate_limit }
				onChange={ setField }
				fullWidth
			/>

			<TextField
				label={ __( 'Rate Limit Window (seconds)', 'blank' ) }
				type="number"
				helperText={ __(
					'The time window (in seconds) during which the request limit applies.',
					'blank'
				) }
				name="rest_api_rate_limit_time"
				value={ form.rest_api_rate_limit_time }
				onChange={ setField }
				fullWidth
			/>

			<FormControl component="fieldset">
				<FormControlLabel
					control={
						<Switch
							checked={ !! form.rest_api_protect_wp_rest_routes }
							name="rest_api_protect_wp_rest_routes"
							onChange={ setField }
						/>
					}
					label={ __( 'Protect WordPress Rest Routes', 'blank' ) }
				/>
				<FormHelperText>
					{ __(
						'Enforce authorization on WordPress rest routes /wp-json/wp/v2/',
						'blank'
					) }
				</FormHelperText>
			</FormControl>
		</Stack>
	);
}

function SimpleSelect( {
	label,
	helperText,
	name,
	value,
	options,
	defaultLabel,
	onChange,
} ) {
	return (
		<FormControl fullWidth>
			<InputLabel id={ `${ name }-label` }>{ label }</InputLabel>
			<Select
				labelId={ `${ name }-label` }
				id={ name }
				name={ name }
				value={ value }
				label={ label }
				onChange={ onChange }
			>
				<MenuItem value={ defaultLabel.value }>
					<em>
						{ defaultLabel.label ? defaultLabel.label : 'None' }
					</em>
				</MenuItem>

				{ options.map( ( option, index ) =>
					option.value && option.label ? (
						<MenuItem
							key={ name + option.value }
							value={ option.value }
						>
							{ option.label }
						</MenuItem>
					) : null
				) }
			</Select>
			{ helperText && <FormHelperText>{ helperText }</FormHelperText> }
		</FormControl>
	);
}

function MultipleSelect( {
	label,
	helperText,
	name,
	value,
	options,
	onChange,
} ) {
	const MenuProps = {
		PaperProps: {
			style: {
				maxHeight: 48 * 4.5 + 8,
				width: 250,
			},
		},
	};

	const safeValue = Array.isArray( value ) ? value : [];

	return (
		<FormControl fullWidth>
			<InputLabel id={ `${ name }-label` }>{ label }</InputLabel>

			<Select
				labelId={ `${ name }-label` }
				id={ name }
				name={ name }
				multiple
				value={ safeValue }
				onChange={ ( e ) => {
					onChange( e );
				} }
				input={ <OutlinedInput label={ label } /> }
				renderValue={ ( selected ) => (
					<Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.5 } }>
						{ Array.isArray( selected )
							? selected.map( ( val ) => {
									const option = options.find(
										( o ) => o.value === val
									);
									return option ? (
										<Chip
											key={ val }
											label={ option.label }
										/>
									) : null;
							  } )
							: null }
					</Box>
				) }
				MenuProps={ MenuProps }
			>
				{ options.map( ( option ) =>
					option?.value != null && option?.label ? (
						<MenuItem key={ option.value } value={ option.value }>
							{ option.label }
						</MenuItem>
					) : null
				) }
			</Select>
			{ helperText && <FormHelperText>{ helperText }</FormHelperText> }
		</FormControl>
	);
}
