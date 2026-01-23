import { useState, useEffect } from '@wordpress/element';
import { useAdminData } from './contexts/AdminDataContext';
import useSettingsForm from './contexts/useSettingsForm';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import Webhook from './components/Webhook';
import RestContentSettings from './components/RestContentSettings';
import RestApiSettings from './components/RestApiSettings';
import CoreSettings from './components/CoreSettings';

import Firewall from './components/Firewall/Firewall';

function TabPanel({ value, index, children }) {
	return (
		<div role="tabpanel" hidden={value !== index}>
			{value === index && <Box sx={{ pt: 2, maxWidth: 600 }}>{children}</Box>}
		</div>
	);
}

export default function App() {
	const { adminData, updateAdminData } = useAdminData();
	const { __ } = wp.i18n || {};
	const [ users, setUsers ] = useState( [] );
	const [ restApiUser, setRestApiUser ] = useState( [] );
	const [ postTypes, setPostTypes ] = useState( [] );
	const [tabIndex, setTabIndex] = useState(0);


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


	const handleTabChange = (_, newValue) => {
		setTabIndex(newValue);
	};

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


	if ( ! adminData ) {
		return null;
	}

	return (
		<>
			<Paper
				sx={ { maxWidth: '100%', mx: 'auto', my: 4, p: 3 } }
				elevation={ 2 }
			>
				<form onSubmit={ handleSubmit }>
					
					<Stack spacing={ 3 } justifyContent={'space-between'} direction={ { xs: 'column', sm: 'row' } }>
						
						
						<Stack spacing={ 3 } direction={ 'row' }>
							<Typography variant="h5" sx={ { fontWeight: 600 } }>
							{ __( 'REST API Settings', 'blank' ) }
						</Typography>
						<Firewall />
						
						</Stack>
						<Button
							type="submit"
							variant="contained"
							color="primary"
						>
							{ __( 'Save Settings', 'blank' ) }
						</Button>
						
					</Stack>
					<Divider sx={{py:1,mb:2}} />
					<Tabs
						value={tabIndex}
						onChange={handleTabChange}
						variant="scrollable"
						scrollButtons="auto"
						aria-label="REST API settings tabs"
					>
						<Tab label={__('Security', 'blank')} />
						<Tab label={__('Content', 'blank')} />
						<Tab label={__('Webhooks', 'blank')} />
						<Tab label={__('Core', 'blank')} />
					</Tabs>

					<TabPanel value={tabIndex} index={0}>
						<RestApiSettings
							form={ form }
							setField={ setField }
							users={ users }
							restApiUser={ restApiUser }
						/>
					</TabPanel>

					<TabPanel value={tabIndex} index={1}>
						<RestContentSettings
							form={ form }
							setField={ setField }
							postTypes={ postTypes }
						/>
					</TabPanel>
					

					<TabPanel value={tabIndex} index={2}>
						<Webhook 
						form={ form } 
						setField={ setField } />
					</TabPanel>

					<TabPanel value={tabIndex} index={3}>
						<CoreSettings 
						form={ form } 
						setField={ setField } 
						setSlider={setSlider} />
					</TabPanel>			
				
					
				</form>
			</Paper>

			<Dialog
				open={ confirmOpen }
				onClose={ closeConfirm }
				aria-labelledby="confirm-dialog-title"
				maxWidth="xs"
				sx={{'&': {pl:{xs:0, md:'160px'}}}}
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
