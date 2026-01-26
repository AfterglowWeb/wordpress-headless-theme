import { useState, useEffect } from '@wordpress/element';
import { useAdminData } from './contexts/AdminDataContext';
import { DialogProvider, useDialog, DIALOG_TYPES } from './contexts/DialogContext';
import useSettingsForm from './contexts/useSettingsForm';

import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import ConfirmDialog from './components/ConfirmDialog';
import Webhook from './components/Webhook';
import RestContentSettings from './components/RestContentSettings';
import CoreSettings from './components/CoreSettings';
import Firewall from './components/Firewall/Firewall';

function TabPanel({ value, index, children }) {
	return (
		<div role="tabpanel" hidden={value !== index}>
			{value === index && <Box maxWidth="xl" py={2}>{children}</Box>}
		</div>
	);
}

function AppContent() {
	const { adminData, updateAdminData } = useAdminData();
	const { __ } = wp.i18n || {};
	const { openDialog, updateDialog } = useDialog();

	const [ postTypes, setPostTypes ] = useState( [] );
	const [ tabIndex, setTabIndex ] = useState(0);

	const {
		form,
		setField,
		setSlider,
		submit,
	} = useSettingsForm( {
		adminData,
		updateAdminData,
		action: 'blank_theme_update_options',
	} );

	const handleTabChange = (_, newValue) => {
		setTabIndex(newValue);
	};

	const minDelay = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

	useEffect( () => {
		if ( Array.isArray( adminData?.post_types ) ) {
			setPostTypes( adminData.post_types );
		}
	}, [ adminData ] );

	const handleSubmit = ( e ) => {
		e.preventDefault();

		openDialog( {
			type: DIALOG_TYPES.CONFIRM,
			title: __( 'Confirm Save', 'blank' ),
			content: __( 'Are you sure you want to save these settings?', 'blank' ),
			onConfirm: async () => {
				updateDialog( {
					type: DIALOG_TYPES.LOADING,
					title: __( 'Saving', 'blank' ),
					content: __( 'Saving...', 'blank' ),
				} );

				try {
					await Promise.all( [
						submit(),
						minDelay( 400 ),
					] );
					updateDialog( {
						type: DIALOG_TYPES.SUCCESS,
						title: __( 'Success', 'blank' ),
						content: __( 'Settings saved successfully!', 'blank' ),
						autoClose: 2000,
					} );
				} catch ( err ) {
					updateDialog( {
						type: DIALOG_TYPES.ERROR,
						title: __( 'Error', 'blank' ),
						content: err.message,
					} );
				}
			},
		} );
	};

	if ( ! adminData ) {
		return null;
	}

	return (
		<Paper
			sx={ { maxWidth: '100%', mx: 'auto', px: 3, pb:3 } }
			elevation={ 2 }
		>
			<form onSubmit={ handleSubmit }>
				<Tabs
					value={tabIndex}
					onChange={handleTabChange}
					variant="scrollable"
					scrollButtons="auto"
					aria-label="REST API settings tabs"
				>
					<Tab label={__('REST API Firewall', 'blank')} />
					<Tab label={__('REST API Content', 'blank')} />
					<Tab label={__('Application Webhook', 'blank')} />
					<Tab label={__('Core Options', 'blank')} />
				</Tabs>

				<TabPanel value={tabIndex} index={0}>
					<Firewall />
				</TabPanel>

				<TabPanel value={tabIndex} index={1}>
					<Stack direction={"row"} justifyContent={"space-between"} gap={2} py={3} flexWrap={"wrap"} alignItems={"center"}>
						<Typography variant="h6" fontWeight={600}>
							{ __( 'REST API Content', 'blank' ) }
						</Typography>
						<Button
							type="submit"
							variant="contained"
							>
							{ __( 'Save Content Settings', 'blank' ) }
						</Button>
					</Stack>
					<RestContentSettings
						form={ form }
						setField={ setField }
						postTypes={ postTypes }
					/>
				</TabPanel>


				<TabPanel value={tabIndex} index={2}>
					<Stack direction={"row"} justifyContent={"space-between"} gap={2} py={3} flexWrap={"wrap"} alignItems={"center"}>
						<Typography variant="h6" fontWeight={600}>
							{ __( 'Application Webhook', 'blank' ) }
						</Typography>
					</Stack>
					<Webhook
					form={ form }
					setField={ setField } />
				</TabPanel>

				<TabPanel value={tabIndex} index={3}>
					<Stack direction={"row"} justifyContent={"space-between"} gap={2} py={3} flexWrap={"wrap"} alignItems={"center"}>
						<Typography variant="h6" fontWeight={600}>
							{ __( 'Core Options', 'blank' ) }
						</Typography>
						<Button
							type="submit"
							variant="contained"
							sx={{ml:3}}
							>
							{ __( 'Save Core Options', 'blank' ) }
						</Button>
					</Stack>
					<CoreSettings
					form={ form }
					setField={ setField }
					setSlider={setSlider} />
				</TabPanel>


			</form>
		</Paper>
	);
}

export default function App() {
	return (
		<DialogProvider>
			<AppContent />
			<ConfirmDialog />
		</DialogProvider>
	);
}
