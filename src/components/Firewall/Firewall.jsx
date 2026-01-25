import { useState, useEffect, useCallback } from '@wordpress/element';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useDialog, DIALOG_TYPES } from '../../contexts/DialogContext';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import RoutesTree from './RoutesTree';

const defaultFirewallOptions = {
	enforce_auth: false,
	user_id: 0,
	rate_limit: 30,
	rate_limit_time: 60,
};

export default function Firewall() {
	const { adminData } = useAdminData();
	const { __ } = wp.i18n || {};
	const [ restRoutes, setRestRoutes ] = useState( null );
	const [ dialogOpen, setDialogOpen ] = useState( false );
	const [ treeState, setTreeState ] = useState( null );
	const [ loading, setLoading ] = useState( false );
	const [ firewallOptions, setFirewallOptions ] = useState( defaultFirewallOptions );
	const [ users, setUsers ] = useState( [] );

	const { openDialog, updateDialog } = useDialog();

	const minDelay = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

	// Load users from adminData
	useEffect( () => {
		if ( Array.isArray( adminData?.users ) ) {
			setUsers( adminData.users );
		}
	}, [ adminData ] );

	const loadRoutes = useCallback( async () => {
		setLoading( true );
		try {
			const response = await fetch( adminData.ajaxurl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: new URLSearchParams( {
					action: 'list_rest_api_routes',
					nonce: adminData.nonce,
				} ),
			} );

			const result = await response.json();

			if ( result?.success ) {
				setRestRoutes( result.data );
			}
		} catch ( error ) {
			console.error( 'Error loading routes:', error );
		} finally {
			setLoading( false );
		}
	}, [ adminData ] );

	const loadFirewallOptions = useCallback( async () => {
		try {
			const response = await fetch( adminData.ajaxurl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: new URLSearchParams( {
					action: 'get_firewall_options',
					nonce: adminData.nonce,
				} ),
			} );

			const result = await response.json();

			if ( result?.success && result?.data ) {
				setFirewallOptions( {
					enforce_auth: result.data.enforce_auth ?? false,
					user_id: result.data.user_id ?? 0,
					rate_limit: result.data.rate_limit ?? 30,
					rate_limit_time: result.data.rate_limit_time ?? 60,
				} );
			}
		} catch ( error ) {
			console.error( 'Error loading firewall options:', error );
		}
	}, [ adminData ] );

	useEffect( () => {
		loadRoutes();
		loadFirewallOptions();
	}, [ loadRoutes, loadFirewallOptions ] );

	const handleTreeChange = ( updatedNodes ) => {
		setTreeState( updatedNodes );
	};

	const handleOptionChange = ( e ) => {
		const { name, value, type, checked } = e.target;
		setFirewallOptions( ( prev ) => ( {
			...prev,
			[ name ]: type === 'checkbox' ? checked : value,
		} ) );
	};

	const handleSave = () => {
		openDialog( {
			type: DIALOG_TYPES.CONFIRM,
			title: __( 'Confirm Save', 'blank' ),
			content: __( 'Are you sure you want to save these firewall settings?', 'blank' ),
			onConfirm: async () => {
				updateDialog( {
					type: DIALOG_TYPES.LOADING,
					title: __( 'Saving', 'blank' ),
					content: __( 'Saving...', 'blank' ),
				} );

				try {
					// Save both options and policy in parallel
					const [ optionsResponse, policyResponse ] = await Promise.all( [
						fetch( adminData.ajaxurl, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
							},
							body: new URLSearchParams( {
								action: 'save_firewall_options',
								nonce: adminData.nonce,
								enforce_auth: firewallOptions.enforce_auth ? '1' : '0',
								user_id: String( firewallOptions.user_id ),
								rate_limit: String( firewallOptions.rate_limit ),
								rate_limit_time: String( firewallOptions.rate_limit_time ),
							} ),
						} ),
						treeState
							? fetch( adminData.ajaxurl, {
									method: 'POST',
									headers: {
										'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
									},
									body: new URLSearchParams( {
										action: 'save_rest_api_policy',
										nonce: adminData.nonce,
										tree: JSON.stringify( treeState ),
									} ),
							  } )
							: Promise.resolve( { json: () => ( { success: true } ) } ),
						minDelay( 400 ),
					] );

					const optionsResult = await optionsResponse.json();
					const policyResult = await policyResponse.json();

					if ( optionsResult?.success && policyResult?.success ) {
						updateDialog( {
							type: DIALOG_TYPES.SUCCESS,
							title: __( 'Success', 'blank' ),
							content: __( 'Firewall settings saved successfully!', 'blank' ),
							autoClose: 2000,
						} );
						await loadRoutes();
					} else {
						const errorMessage =
							optionsResult?.data?.message ||
							policyResult?.data?.message ||
							'Unknown error';
						updateDialog( {
							type: DIALOG_TYPES.ERROR,
							title: __( 'Error', 'blank' ),
							content: __( 'Failed to save settings: ', 'blank' ) + errorMessage,
						} );
					}
				} catch ( error ) {
					updateDialog( {
						type: DIALOG_TYPES.ERROR,
						title: __( 'Error', 'blank' ),
						content: __( 'Error saving settings: ', 'blank' ) + error.message,
					} );
				}
			},
		} );
	};

	return (
		<>
			<Button
				onClick={ () => setDialogOpen( true ) }
				variant="contained"
				color="primary"
			>
				{ __( 'Firewall Setup', 'blank' ) }
			</Button>

			<Dialog
				open={ dialogOpen }
				onClose={ () => setDialogOpen( false ) }
				aria-labelledby="firewall-dialog-title"
				maxWidth="xl"
				fullWidth
				keepMounted
				sx={ {
					'& .MuiPaper-root': {
						minHeight: 'calc(100vh - 64px)',
					},
				} }
			>
				<DialogTitle id="firewall-dialog-title">
					<Stack direction="row" alignItems="center" justifyContent="space-between">
						<span>{ __( 'Firewall Settings', 'blank' ) }</span>
						<Tooltip title={ __( 'Refresh routes from server', 'blank' ) }>
							<IconButton onClick={ loadRoutes } disabled={ loading } size="small">
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				</DialogTitle>
				<DialogContent dividers>
					{ /* Firewall Options Form */ }
					<Box sx={ { mb: 3 } }>
						<Typography variant="subtitle1" sx={ { fontWeight: 600, mb: 2 } }>
							{ __( 'Global Settings', 'blank' ) }
						</Typography>

						<Stack spacing={ 3 }>
							<FormControl component="fieldset">
								<FormControlLabel
									control={
										<Switch
											checked={ !! firewallOptions.enforce_auth }
											name="enforce_auth"
											onChange={ handleOptionChange }
										/>
									}
									label={ __( 'Protect REST API', 'blank' ) }
								/>
								<FormHelperText>
									{ __(
										'Enforce authorization on all REST API routes.',
										'blank'
									) }
								</FormHelperText>
							</FormControl>

							<FormControl fullWidth>
								<InputLabel id="user-id-label">
									{ __( 'REST API User', 'blank' ) }
								</InputLabel>
								<Select
									labelId="user-id-label"
									id="user_id"
									name="user_id"
									value={ firewallOptions.user_id }
									label={ __( 'REST API User', 'blank' ) }
									onChange={ handleOptionChange }
								>
									<MenuItem value={ 0 }>
										<em>{ __( 'Select User', 'blank' ) }</em>
									</MenuItem>
									{ users.map( ( user ) =>
										user.value && user.label ? (
											<MenuItem key={ user.value } value={ user.value }>
												{ user.label }
											</MenuItem>
										) : null
									) }
								</Select>
								<FormHelperText>
									{ __( 'Restrict REST API authentication to this user.', 'blank' ) }
								</FormHelperText>
							</FormControl>

							<Stack direction="row" gap={ 2 }>
								<TextField
									label={ __( 'Rate Limit Requests', 'blank' ) }
									type="number"
									helperText={ __(
										'Maximum requests before rate-limiting.',
										'blank'
									) }
									name="rate_limit"
									value={ firewallOptions.rate_limit }
									onChange={ handleOptionChange }
									fullWidth
								/>

								<TextField
									label={ __( 'Rate Limit Window (seconds)', 'blank' ) }
									type="number"
									helperText={ __(
										'Time window for the request limit.',
										'blank'
									) }
									name="rate_limit_time"
									value={ firewallOptions.rate_limit_time }
									onChange={ handleOptionChange }
									fullWidth
								/>
							</Stack>
						</Stack>
					</Box>

					<Divider sx={ { my: 2 } } />

					<Typography variant="subtitle1" sx={ { fontWeight: 600, mb: 2 } }>
						{ __( 'Route Policies', 'blank' ) }
					</Typography>

					{ /* Routes Tree */ }
					{ loading ? (
						<Stack
							direction="row"
							justifyContent="center"
							alignItems="center"
							sx={ { minHeight: 352 } }
						>
							<CircularProgress />
						</Stack>
					) : (
						<RoutesTree
							treeData={ restRoutes }
							onSettingsChange={ handleTreeChange }
							enforceAuth={ firewallOptions.enforce_auth }
						/>
					) }
				</DialogContent>
				<DialogActions>
					<Button
						color="default"
						variant="outlined"
						onClick={ () => setDialogOpen( false ) }
					>
						{ __( 'Close', 'blank' ) }
					</Button>
					<Button color="primary" variant="contained" onClick={ handleSave }>
						{ __( 'Save', 'blank' ) }
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
