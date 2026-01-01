import { useState, useEffect } from '@wordpress/element';
import { useTheme } from '@mui/material/styles';
import { useAdminData } from './contexts/AdminDataContext';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
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

export default function App() {
	const adminData = useAdminData();
	const [adminDataLoading, setAdminDataLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [postTypes, setPostTypes] = useState([]);
	const [adminOptions, setAdminOptions] = useState({});
	const theme = useTheme();

	function valueLabelFormat(value) {
		if (value >= 1024) {
			return (value / 1024) + ' MB';
		}
		return value + ' KB';
	}

	const [form, setForm] = useState({
		blank_allowed_post_types: adminOptions?.blank_allowed_post_types?.value || [],
		blank_disable_gutenberg_post_types: adminOptions?.blank_disable_gutenberg_post_types?.value,
		rest_api_user_id: adminOptions?.rest_api_user_id?.value || '',
		rest_api_password_name: adminOptions?.rest_api_password_name?.value || '',
		application_user_id: adminOptions?.application_user_id?.value || '',
		application_password_name: adminOptions?.application_password_name?.value || '',
		application_host: adminOptions?.application_host?.value || '',
		application_cache_route: adminOptions?.application_cache_route?.value || '',
		disable_comments: !!adminOptions?.disable_comments?.value,
		max_upload_size: adminOptions?.max_upload_size?.value || 1024, // default 1Mo
		enable_max_upload_size: !!adminOptions?.enable_max_upload_size?.value,
	});

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');
	const [snackbarSeverity, setSnackbarSeverity] = useState('success');

	const restPasswordOptions = (() => {
		const selectedUser = users.find(u => u.value === form.rest_api_user_id);
		if (selectedUser && selectedUser.password_names) {
			return Object.entries(selectedUser.password_names).map(([index, name]) => ({
				value: name,
				label: name
			}));
		}
		return [];
	})();

	const applicationPasswordOptions = (() => {
		const selectedUser = users.find(u => u.value === form.application_user_id);
		if (selectedUser && selectedUser.password_names) {
			return Object.entries(selectedUser.password_names).map(([index, name]) => ({
				value: name,
				label: name
			}));
		}
		return [];
	})();

	useEffect(() => {
		if (!adminData && adminDataLoading) {
			return;
		}
		setAdminDataLoading(false);
		if (adminData && Array.isArray(adminData.users)) {
			setUsers(adminData.users);
		}
		if (adminData && Array.isArray(adminData.post_types)) {
			setPostTypes(adminData.post_types);
		}
		if (adminData && adminData.admin_options) {
			const adminOptions = adminData.admin_options;
			setAdminOptions(adminOptions);
			setForm({
				blank_allowed_post_types: adminOptions.blank_allowed_post_types?.value || [],
				blank_disable_gutenberg_post_types: adminOptions.blank_disable_gutenberg_post_types?.value,
				rest_api_user_id: adminOptions.rest_api_user_id?.value || '',
				rest_api_password_name: adminOptions.rest_api_password_name?.value || '',
				application_user_id: adminOptions.application_user_id?.value || '',
				application_password_name: adminOptions.application_password_name?.value || '',
				application_host: adminOptions.application_host?.value || '',
				application_cache_route: adminOptions.application_cache_route?.value || '',
				disable_comments: !!adminOptions.disable_comments?.value,
				max_upload_size: adminOptions.max_upload_size?.value || 1024,
				enable_max_upload_size: !!adminOptions.enable_max_upload_size?.value,
			}); 
		}
	}, [adminData, adminDataLoading]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSliderChange = (event, newValue) => {
		setForm(prev => ({ ...prev, max_upload_size: newValue }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setConfirmOpen(true);
	};

	const handleConfirmSave = async () => {
		setConfirmOpen(false);
		if (!adminData?.nonce || !adminData?.ajaxurl) {
			setSnackbarMessage('Missing AJAX configuration.');
			setSnackbarSeverity('error');
			setSnackbarOpen(true);
			return;
		}
		const saveForm = {
			...form,
		};
		try {
			const response = await fetch(adminData.ajaxurl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: new URLSearchParams({
					action: 'blank_theme_update_options',
					nonce: adminData.nonce,
					options: JSON.stringify(saveForm),
				}),
			});
			const data = await response.json();
			if (data.success) {
				setSnackbarMessage('Settings saved successfully!');
				setSnackbarSeverity('success');
			} else {
				setSnackbarMessage('Error: ' + (data.data?.error || 'Unknown error'));
				setSnackbarSeverity('error');
			}
		} catch (err) {
			setSnackbarMessage('AJAX error: ' + err.message);
			setSnackbarSeverity('error');
		}
		setSnackbarOpen(true);
	};

	const handleCancelSave = () => {
		setConfirmOpen(false);
	};

	const handleSnackbarClose = (event, reason) => {
		if (reason === 'clickaway') return;
		setSnackbarOpen(false);
	};

	useEffect(() => {
		if (form.rest_api_user_id === '') {
			setForm(prev => ({
				...prev,
				rest_api_password_name: '',
			}));
		}
	}, [form.rest_api_user_id]);

	useEffect(() => {
		if (form.application_user_id === '') {
			setForm(prev => ({
				...prev,
				application_password_name: '',
			}));
		}
	}, [form.application_user_id]);

	if (!adminData && adminDataLoading) {
		return null;
	}

	return (
		<>
			<Paper sx={{ maxWidth: 600, mx: 'auto', my: 4, p: 3 }} elevation={2}>
				<form onSubmit={handleSubmit}>
					<Stack spacing={3}>

						<Box sx={{ minWidth: 120 }}>
							{postTypes && <MultipleSelect 
							name="blank_allowed_post_types" 
							label={adminOptions?.blank_allowed_post_types?.label || 'Allowed Post Types Through Rest API'} 
							value={form.blank_allowed_post_types} 
							options={postTypes} 
							onChange={handleChange} />}
						</Box>


						<Box sx={{ minWidth: 120 }}>
							<SimpleSelect 
							name="rest_api_user_id" 
							label={adminOptions?.rest_api_user_id?.label || 'Rest API User'} 
							value={form.rest_api_user_id} 
							options={users} 
							defaultLabel={{ value: 0, label: 'Select a user' }}
							onChange={handleChange} />
						</Box>
						
						<Box sx={{ minWidth: 120 }}>
							<SimpleSelect
							name="rest_api_password_name"
							label={adminOptions?.rest_api_password_name?.label || 'Rest API Password Key'}
							value={form.rest_api_password_name}
							options={restPasswordOptions}
							defaultLabel={{ value: '', label: form.rest_api_user_id ? '' : 'Select a Rest API User First' }}
							onChange={handleChange}
							/>
						</Box>
						<Divider />
						<Box sx={{ minWidth: 120 }}>
							<SimpleSelect 
							name="application_user_id" 
							label={adminOptions?.application_user_id?.label || 'Application User'} 
							value={form.application_user_id} 
							options={users} 
							defaultLabel={{ value: 0, label: 'Select a user' }}
							onChange={handleChange} />
						</Box>
						<Box sx={{ minWidth: 120 }}>
							<SimpleSelect
							name="application_password_name"
							label={adminOptions?.application_password_name?.label || 'Application Password Key'}
							value={form.application_password_name}
							options={applicationPasswordOptions}
							defaultLabel={{ value: '', label: form.application_user_id ? '' : 'Select an Application User First' }}
							onChange={handleChange}
							/>
						</Box>


						<TextField
							label={adminData?.application_host?.label || 'Application Host'}
							name="application_host"
							value={form.application_host}
							onChange={handleChange}
							fullWidth
						/>
						<TextField
							label={adminData?.application_cache_route?.label || 'Application Cache Route'}
							name="application_cache_route"
							value={form.application_cache_route}
							onChange={handleChange}
							fullWidth
						/>

													<Divider />

						<FormControlLabel
							control={
								<Switch
									checked={form.blank_disable_gutenberg_post_types}
									name="blank_disable_gutenberg_post_types"
									onChange={handleChange}
								/>
							}
							label={adminData?.blank_disable_gutenberg_post_types?.label || 'Disable Gutenberg Editor on Post Types'}
						/>

						<FormControlLabel
							control={
								<Switch
									checked={form.disable_comments}
									name="disable_comments"
									onChange={handleChange}
								/>
							}
							label={adminData?.disable_comments?.label || 'Disable Comments'}
						/>

						<Box sx={{px:1.5}}>
							<Stack direction={{ xs: 'column', sm: 'row' }} >
								<FormControlLabel
									control={
										<Switch
											checked={form.enable_max_upload_size}
											name="enable_max_upload_size"
											onChange={handleChange}
										/>
									}
									label={adminData?.enable_max_upload_size?.label || 'Limit Images Weight'}
								/>
								<Typography 
								sx={{display:'flex', alignItems:'center', mb:0}}
								color={form.enable_max_upload_size ? theme.palette.primary.main : theme.palette.text.disabled}
								id="max-upload-size-slider" gutterBottom>
									{adminOptions?.max_upload_size?.label || 'Max Upload Size'}: {valueLabelFormat(form.max_upload_size)}
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
									onChange={handleSliderChange}
									valueLabelDisplay="auto"
									aria-labelledby="max-upload-size-slider"
								/>
							</Box>
							<Button type="submit" variant="contained" color="primary">
								Save Settings
							</Button>
						</Stack>
				</form>
			</Paper>

			{/* Confirmation Dialog */}
			<Dialog
				open={confirmOpen}
				onClose={handleCancelSave}
				aria-labelledby="confirm-dialog-title"
			>
				<DialogTitle id="confirm-dialog-title">Confirm Save</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to save these settings?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCancelSave} color="secondary">Cancel</Button>
					<Button onClick={handleConfirmSave} color="primary" autoFocus>Confirm</Button>
				</DialogActions>
			</Dialog>

			{/* Snackbar Alert */}
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={5000}
				onClose={handleSnackbarClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
					{snackbarMessage}
				</MuiAlert>
			</Snackbar>
		</>
	);
}

function SimpleSelect({ label, name, value, options, defaultLabel, onChange }) {
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
		</FormControl>
	);
}

function MultipleSelect({ label, name, value, options, onChange }) {
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <FormControl fullWidth sx={{ width: 300 }}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>

      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}                // important for event.target.name
        multiple
        value={value}
        onChange={(e) => {
          // MUI returns the array in e.target.value
          onChange(e);
        }}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((val) => {
              const option = options.find((o) => o.value === val);
              return option ? <Chip key={val} label={option.label} /> : null;
            })}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {options.map((option) =>
          option.value && option.label ? (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ) : null
        )}
      </Select>
    </FormControl>
  );
}
