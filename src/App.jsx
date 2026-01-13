import { useState, useEffect } from '@wordpress/element';
import { useTheme } from '@mui/material/styles';
import { useAdminData } from './contexts/AdminDataContext';
import useSettingsForm from './contexts/useSettingsForm';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';

import Webhook from './components/Webhook';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function App() {
	const { adminData, updateAdminData } = useAdminData();
	const theme = useTheme();
	const { __ } = wp.i18n || {};

	const {
		form,
		setField,
		setSlider,
		submit,
		openConfirm,
		closeConfirm,
		confirmOpen,
		justSaved,
	} = useSettingsForm({
		adminData,
		updateAdminData,
		action: 'blank_theme_update_options',
	});

	const [users, setUsers] = useState([]);
	const [restApiUser, setRestApiUser] = useState({});
	const [postTypes, setPostTypes] = useState([]);

	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');
	const [snackbarSeverity, setSnackbarSeverity] = useState('success');

	useEffect(() => {
		if (Array.isArray(adminData?.users)) setUsers(adminData.users);
		if (Array.isArray(adminData?.post_types)) setPostTypes(adminData.post_types);
	}, [adminData]);

	useEffect(() => {
		if(form.rest_api_user_id && users) {
			const currentUser = users.filter((user) => form.rest_api_user_id === user.value );
			if(currentUser && currentUser.length > 0) {
				setRestApiUser(currentUser[0]);
			}
		}
	}, [users, form.rest_api_user_id]);

	const handleSubmit = (e) => {
		e.preventDefault();
		openConfirm();
	};

	const handleConfirmSave = async () => {
		try {
			await submit();
			setSnackbarMessage(__('Settings saved successfully!', 'blank'));
			setSnackbarSeverity('success');
		} catch (err) {
			setSnackbarMessage(err.message);
			setSnackbarSeverity('error');
		}
		setSnackbarOpen(true);
		closeConfirm();
	};

	const handleSnackbarClose = (_, reason) => {
		if (reason === 'clickaway') return;
		setSnackbarOpen(false);
	};

	const valueLabelFormat = (value) =>
		value >= 1024 ? `${value / 1024} MB` : `${value} KB`;

	if (!adminData) return null;

	return (
		<>
			<Paper sx={{ maxWidth: 600, mx: 'auto', my: 4, p: 3 }} elevation={2}>
				<form onSubmit={handleSubmit}>
					<Stack spacing={3}>

						<Box sx={{ minWidth: 120 }}>
							{postTypes && <MultipleSelect 
							name="blank_allowed_post_types" 
							label={__('Handle Post Types', 'blank')} 
							value={form.blank_allowed_post_types} 
							options={postTypes} 
							onChange={setField} />}
						</Box>

						<Box sx={{ minWidth: 120 }}>
							<SimpleSelect 
							name="rest_api_user_id" 
							label={__('Rest API User', 'blank')} 
							helperText={__('Restrict REST API access to a specific application user.', 'blank')}
							value={form.rest_api_user_id} 
							options={users} 
							defaultLabel={{ value: 0, label: __('Select User', 'blank') }}
							onChange={setField} />

							{form.rest_api_user_id && restApiUser && restApiUser?.admin_url ?
								<Typography
								component="a"
								href={restApiUser.admin_url}
								variant="body.2"
								target="_blank"
								sx={{display:'flex', alignItems:'center', gap:'4px', px:'14px', fontSize:'12px'}}
								>{__('User profile', 'blank')}<OpenInNewIcon fontSize='inherut' /></Typography>
							 : null}
						</Box>

						<TextField
							label={__('Rate Limit Requests', 'blank')}
							type="number"
							helperText={__('The maximum number of REST API requests a user can make before being rate-limited.', 'blank')}
							name="rest_api_rate_limit"
							value={form.rest_api_rate_limit}
							onChange={setField}
							fullWidth
						/>

						<TextField
							label={__('Rate Limit Window (seconds)', 'blank')}
							type="number"
							helperText={__('The time window (in seconds) during which the request limit applies.', 'blank')}
							name="rest_api_rate_limit_time"
							value={form.rest_api_rate_limit_time}
							onChange={setField}
							fullWidth
						/>

						<FormControl component="fieldset">
							<FormControlLabel
								control={
									<Switch
										checked={!!form.blank_protect_wp_rest_routes}
										name="blank_protect_wp_rest_routes"
										onChange={setField}
									/>
								}
								label={__('Protect WordPress Rest Routes', 'blank')}
							/>
							<FormHelperText>{__('Enforce authorization on WordPress rest routes /wp-json/wp/v2/', 'blank')}</FormHelperText>
						</FormControl>
						
						<Divider />

						<Webhook form={form} setField={setField} />

						<Divider />

						<FormControlLabel
							control={
								<Switch
									checked={!!form.blank_disable_gutenberg}
									name="blank_disable_gutenberg"
									onChange={setField}
								/>
							}
							label={__('Disable Gutenberg', 'blank')}
						/>

						<FormControlLabel
							control={
								<Switch
									checked={!!form.blank_disable_comments}
									name="blank_disable_comments"
									onChange={setField}
								/>
							}
							label={__('Disable Comments', 'blank')}
						/>

						<FormControlLabel
							control={
								<Switch
									checked={!!form.blank_enable_acf_support}
									name="blank_enable_acf_support"
									onChange={setField}
								/>
							}
							label={__('Enable ACF Support', 'blank')}
						/>

						<Box sx={{px:1.5}}>
							<Stack direction={{ xs: 'column', sm: 'row' }} >
								<FormControlLabel
									control={
										<Switch
											checked={!!form.enable_max_upload_size}
											name="enable_max_upload_size"
											onChange={setField}
										/>
									}
									label={__('Limit Images Weight', 'blank')}
								/>
								<Typography 
								sx={{display:'flex', alignItems:'center', mb:0}}
								color={form.enable_max_upload_size ? theme.palette.primary.main : theme.palette.text.disabled}
								id="max-upload-size-slider" gutterBottom>
									{__('Max Upload Size', 'blank')} : { valueLabelFormat(form.max_upload_size) }
								</Typography>
							</Stack>

								<Slider
									value={form.max_upload_size}
									min={1}
									max={1024}
									step={1}
									disabled={!form.enable_max_upload_size}
									getAriaValueText={valueLabelFormat}
									valueLabelFormat={valueLabelFormat}
									onChange={(_, value) => setSlider('max_upload_size', value)}
									valueLabelDisplay="auto"
									aria-labelledby="max-upload-size-slider"
								/>
							</Box>
							<Button type="submit" variant="contained" color="primary">
								{__('Save Settings', 'blank')}
							</Button>
					</Stack>
				</form>
			</Paper>

			<Dialog
				open={confirmOpen}
				onClose={closeConfirm}
				aria-labelledby="confirm-dialog-title"
				maxWidth="xs"
			>
				<DialogTitle id="confirm-dialog-title">{__('Confirm Save', 'blank')}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{__('Are you sure you want to save these settings?', 'blank')}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeConfirm} color="default" variant="outlined">{__('Cancel', 'blank')}</Button>
					<Button onClick={handleConfirmSave} color="primary" variant="contained">{__('Confirm', 'blank')}</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={5000}
				onClose={handleSnackbarClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</>
	);
}

function SimpleSelect({ label, helperText, name, value, options, defaultLabel, onChange }) {
	return (
		<FormControl fullWidth>
			<InputLabel id={`${name}-label`}>{label}</InputLabel>
			<Select
				labelId={`${name}-label`}
				id={name}
				name={name}
				value={value}
				label={label}
				onChange={onChange}
			>
			
					<MenuItem value={defaultLabel.value}><em>{defaultLabel.label ? defaultLabel.label : 'None'}</em></MenuItem>
			
				{options.map((option, index) => (
					option.value && option.label ? (
						<MenuItem 
						key={name + option.value} 
						value={option.value}>
							{option.label}
						</MenuItem>
					) : null
				))}
			</Select>
			{helperText && <FormHelperText>{helperText}</FormHelperText>}
		</FormControl>
	);
}

function MultipleSelect({ label, helperText, name, value, options, onChange }) {
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 48 * 4.5 + 8,
        width: 250,
      },
    },
  };

    const safeValue = Array.isArray(value) ? value : [];


  return (
    <FormControl fullWidth>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>

      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        multiple
        value={safeValue}
        onChange={(e) => {
          onChange(e);
        }}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {Array.isArray(selected)
              ? selected.map((val) => {
                  const option = options.find((o) => o.value === val);
                  return option ? <Chip key={val} label={option.label} /> : null;
                })
              : null}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {options.map((option) =>
          option?.value != null && option?.label ? (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ) : null
        )}
      </Select>
	  {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
