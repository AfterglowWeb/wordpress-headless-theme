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

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function RestApiSettings( {
	form,
	setField,
	users,
	restApiUser
} ) {
	const { __ } = wp.i18n || {};

	return (
		<Stack spacing={ 3 }>

			<Typography variant="h6" sx={ { fontWeight: 600 } }>
				{ __( 'Security', 'blank' ) }
			</Typography>

			<Box sx={ { minWidth: 120 } }>
				<SimpleSelect
					name="rest_api_user_id"
					label={ __( 'Rest API User', 'blank' ) }
					helperText={ __(
						'Restrict REST API Auth to 1 User.',
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
	<Stack direction="row" gap={2}>
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
			</Stack>

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
						'Enforce authorization and rate limiting on WordPress rest routes /wp-json/wp/v2/',
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
