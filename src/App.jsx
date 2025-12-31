import { useState } from '@wordpress/element';
import { useAdminData } from './contexts/AdminDataContext';

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
import { useEffect } from 'react';

export default function App() {
	const adminData = useAdminData();
	const [adminDataLoading, setAdminDataLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [adminOptions, setAdminOptions] = useState({});
	const [form, setForm] = useState({
		rest_api_user_id: adminData?.rest_api_user_id?.value || '',
		rest_api_password_key: adminData?.rest_api_password_key?.value || '',
		application_user_id: adminData?.application_user_id?.value || '',
		application_password_key: adminData?.application_password_key?.value || '',
		application_host: adminData?.application_host?.value || '',
		application_cache_route: adminData?.application_cache_route?.value || '',
		disable_comments: !!adminData?.disable_comments?.value,
		max_upload_size: adminData?.max_upload_size?.value || '',
	});


	const restPasswordOptions = (() => {
		const selectedUser = users.find(u => u.value === form.rest_api_user_id);
		if (selectedUser && selectedUser.password_names) {
			return Object.entries(selectedUser.password_names).map(([token, name]) => ({
				value: token,
				label: name
			}));
		}
		return [];
	})();

	const applicationPasswordOptions = (() => {
		const selectedUser = users.find(u => u.value === form.application_user_id);
		if (selectedUser && selectedUser.password_names) {
			return Object.entries(selectedUser.password_names).map(([token, name]) => ({
				value: token,
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
		if (adminData && adminData.admin_options) {
			setAdminOptions(adminData.admin_options);
		}
	}, [adminData, adminDataLoading]);



	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};


	const handleSubmit = (e) => {
		e.preventDefault();
		// TODO: Implement AJAX save routine
		alert('Not implemented: Save config');
	};


	if (!adminData && adminDataLoading) {
		return null;
	}

	return (
		<Paper sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }} elevation={2}>
			<form onSubmit={handleSubmit}>
				<Stack spacing={3}>
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
						name="rest_api_password_key"
						label={adminOptions?.rest_api_password_key?.label || 'Rest API Password Key'}
						value={form.rest_api_password_key}
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
						name="application_password_key"
						label={adminOptions?.application_password_key?.label || 'Application Password Key'}
						value={form.application_password_key}
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
					<TextField
						label={adminData?.max_upload_size?.label || 'Max Upload Size (bytes)'}
						name="max_upload_size"
						type="number"
						value={form.max_upload_size}
						onChange={handleChange}
						fullWidth
					/>
					<Button type="submit" variant="contained" color="primary">
						Save Settings
					</Button>
				</Stack>
			</form>
		</Paper>
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
						<MenuItem key={name + option.value} value={option.value}>{option.label}</MenuItem>
					) : null
				))}
			</Select>
		</FormControl>
	);
}