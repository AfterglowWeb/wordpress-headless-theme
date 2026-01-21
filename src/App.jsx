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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

import Webhook from './components/Webhook';
import RestContentSettings from './components/RestContentSettings';
import RestApiSettings from './components/RestApiSettings';

export default function App() {
	const { adminData, updateAdminData } = useAdminData();
	const theme = useTheme();
	const { __ } = wp.i18n || {};
	const [ users, setUsers ] = useState( [] );
	const [ restApiUser, setRestApiUser ] = useState( [] );
	const [ postTypes, setPostTypes ] = useState( [] );

	const {
		form,
		setField,
		setSlider,
		submit,
		openConfirm,
		closeConfirm,
		confirmOpen,
		justSaved,
	} = useSettingsForm( {
		adminData,
		updateAdminData,
		action: 'blank_theme_update_options',
	} );

	useEffect( () => {
		if ( form.rest_api_user_id && users ) {
			const currentUser = users.filter(
				( user ) => form.rest_api_user_id === user.value
			);
			if ( currentUser && currentUser.length > 0 ) {
				setRestApiUser( currentUser[ 0 ] );
			}
		}
	}, [ users, form.rest_api_user_id ] );

	const [ snackbarOpen, setSnackbarOpen ] = useState( false );
	const [ snackbarMessage, setSnackbarMessage ] = useState( '' );
	const [ snackbarSeverity, setSnackbarSeverity ] = useState( 'success' );

	useEffect( () => {
		if ( Array.isArray( adminData?.users ) ) {
			setUsers( adminData.users );
		}
		if ( Array.isArray( adminData?.post_types ) ) {
			setPostTypes( adminData.post_types );
		}
	}, [ adminData ] );

	const handleSubmit = ( e ) => {
		e.preventDefault();
		openConfirm();
	};

	const handleConfirmSave = async () => {
		try {
			await submit();
			setSnackbarMessage( __( 'Settings saved successfully!', 'blank' ) );
			setSnackbarSeverity( 'success' );
		} catch ( err ) {
			setSnackbarMessage( err.message );
			setSnackbarSeverity( 'error' );
		}
		setSnackbarOpen( true );
		closeConfirm();
	};

	const handleSnackbarClose = ( _, reason ) => {
		if ( reason === 'clickaway' ) {
			return;
		}
		setSnackbarOpen( false );
	};

	const valueLabelFormat = ( value ) =>
		value >= 1024 ? `${ value / 1024 } MB` : `${ value } KB`;

	if ( ! adminData ) {
		return null;
	}

	return (
		<>
			<Paper
				sx={ { maxWidth: 600, mx: 'auto', my: 4, p: 3 } }
				elevation={ 2 }
			>
				<form onSubmit={ handleSubmit }>
					<Stack spacing={ 3 }>
						<RestContentSettings
							form={ form }
							setField={ setField }
						/>

						<Divider />

						<RestApiSettings
							form={ form }
							setField={ setField }
							postTypes={ postTypes }
							users={ users }
							restApiUser={ restApiUser }
						/>

						<Divider />

						<Webhook form={ form } setField={ setField } />

						<Divider />

						<Typography variant="h6" sx={ { fontWeight: 600 } }>
							{ __( 'Core options', 'blank' ) }
						</Typography>

						<FormControlLabel
							control={
								<Switch
									checked={
										!! form.core_disable_gutenberg_enabled
									}
									name="core_disable_gutenberg_enabled"
									onChange={ setField }
								/>
							}
							label={ __( 'Disable Gutenberg', 'blank' ) }
						/>

						<FormControlLabel
							control={
								<Switch
									checked={
										!! form.core_disable_comments_enabled
									}
									name="core_disable_comments_enabled"
									onChange={ setField }
								/>
							}
							label={ __( 'Disable Comments', 'blank' ) }
						/>

						<Box sx={ { px: 1.5 } }>
							<Stack direction={ { xs: 'column', sm: 'row' } }>
								<FormControlLabel
									control={
										<Switch
											checked={
												!! form.core_max_upload_size_enabled
											}
											name="core_max_upload_size_enabled"
											onChange={ setField }
										/>
									}
									label={ __(
										'Limit Images Weight',
										'blank'
									) }
								/>
								<Typography
									sx={ {
										display: 'flex',
										alignItems: 'center',
										mb: 0,
									} }
									color={
										form.core_max_upload_size_enabled
											? theme.palette.primary.main
											: theme.palette.text.disabled
									}
									id="max-upload-size-slider"
									gutterBottom
								>
									{ __( 'Max Upload Size', 'blank' ) } :{ ' ' }
									{ valueLabelFormat(
										form.core_max_upload_size
									) }
								</Typography>
							</Stack>

							<Slider
								value={ form.core_max_upload_size }
								min={ 1 }
								max={ 1024 }
								step={ 1 }
								disabled={ ! form.core_max_upload_size_enabled }
								getAriaValueText={ valueLabelFormat }
								valueLabelFormat={ valueLabelFormat }
								onChange={ ( _, value ) =>
									setSlider( 'core_max_upload_size', value )
								}
								valueLabelDisplay="auto"
								aria-labelledby="max-upload-size-slider"
							/>
						</Box>
						<Button
							type="submit"
							variant="contained"
							color="primary"
						>
							{ __( 'Save Settings', 'blank' ) }
						</Button>
					</Stack>
				</form>
			</Paper>

			<Dialog
				open={ confirmOpen }
				onClose={ closeConfirm }
				aria-labelledby="confirm-dialog-title"
				maxWidth="xs"
			>
				<DialogTitle id="confirm-dialog-title">
					{ __( 'Confirm Save', 'blank' ) }
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{ __(
							'Are you sure you want to save these settings?',
							'blank'
						) }
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={ closeConfirm }
						color="default"
						variant="outlined"
					>
						{ __( 'Cancel', 'blank' ) }
					</Button>
					<Button
						onClick={ handleConfirmSave }
						color="primary"
						variant="contained"
					>
						{ __( 'Confirm', 'blank' ) }
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={ snackbarOpen }
				autoHideDuration={ 5000 }
				onClose={ handleSnackbarClose }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
			>
				<Alert
					onClose={ handleSnackbarClose }
					severity={ snackbarSeverity }
					sx={ { width: '100%' } }
				>
					{ snackbarMessage }
				</Alert>
			</Snackbar>
		</>
	);
}
