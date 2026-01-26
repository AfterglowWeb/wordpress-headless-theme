import { useState, useEffect, useCallback } from '@wordpress/element';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useDialog, DIALOG_TYPES } from '../../contexts/DialogContext';

import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
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

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import RoutesTree from './RoutesTree';

const defaultFirewallOptions = {
	enforce_auth: false,
	enforce_rate_limit: false,
	user_id: 0,
	rate_limit: 30,
	rate_limit_time: 60,
};

export default function Firewall() {
	const { adminData } = useAdminData();
	const { __ } = wp.i18n || {};
	const [ restRoutes, setRestRoutes ] = useState( null );
	const [ treeState, setTreeState ] = useState( null );
	const [ loading, setLoading ] = useState( false );
	const [ firewallOptions, setFirewallOptions ] = useState( defaultFirewallOptions );
	const [ users, setUsers ] = useState( [] );
	const [ restApiUser, setRestApiUser ] = useState( [] );


	const { openDialog, updateDialog } = useDialog();

	const minDelay = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

	useEffect( () => {
		if ( Array.isArray( adminData?.users ) ) {
			setUsers( adminData.users );
		}
	}, [ adminData ] );

	useEffect( () => {
		if ( firewallOptions.user_id && users ) {
			const currentUser = users.filter(
				( user ) => firewallOptions.user_id === user.value
			);
			if ( currentUser && currentUser.length > 0 ) {
				setRestApiUser( currentUser[ 0 ] );
			}
		}
	}, [ users, firewallOptions.user_id ] );

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
					enforce_rate_limit: result.data.enforce_rate_limit ?? false,
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
								enforce_rate_limit: firewallOptions.enforce_rate_limit ? '1' : '0',
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
		<Stack maxWidth="xl">
			<Stack direction={"row"} justifyContent={"space-between"} gap={2} py={3} flexWrap={"wrap"} alignItems={"center"}>
				<Typography variant="h6" fontWeight={600}>
					{ __( 'REST API Firewall', 'blank' ) }
				</Typography>
				<Button color="primary" variant="contained" onClick={ handleSave }>
					{ __( 'Save Firewall Settings', 'blank' ) }
				</Button>
			</Stack>

			<Stack>
				<Stack my={3}>
					<Typography variant="subtitle1" fontWeight={600} sx={ { mb: 2 } }>
						{ __( 'Bulk Settings', 'blank' ) }
					</Typography>

					<Stack spacing={ 3 } direction={{xs:'column', xl:'row'}} gap={ 2 }>

						<Stack spacing={ 3 }>
							<FormControl component="fieldset">
								<FormControlLabel
									control={
										<Switch
											checked={ !! firewallOptions.enforce_auth }
											name="enforce_auth"
											size="small"
											onChange={ handleOptionChange }
										/>
									}
									label={ __( 'Enforce Authentication', 'blank' ) }
								/>
								<FormHelperText>
									<Typography
									variant="caption"
									sx={ { color: 'text.secondary', fontSize: '0.7rem' } }
									>
										{ __('Enforce authentication on all routes', 'blank') }
									</Typography>
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
									<Typography
									variant="caption"
									sx={ { color: 'text.secondary', fontSize: '0.7rem' } }
									>
										{ __( 'Restrict authentication to this user',
											'blank'
										) }
									</Typography>
									<Typography
									variant="caption"
									sx={ { color: 'text.secondary', fontSize: '0.7rem' } }
									>
										{ __( 'You must first create an application password for a user',
											'blank'
										) }
									</Typography>
									{ firewallOptions.user_id &&
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
								</FormHelperText>
							</FormControl>
						</Stack>

						<Stack spacing={ 3 }>
							
							<FormControl component="fieldset">
								<FormControlLabel
									control={
										<Switch
											checked={ !! firewallOptions.enforce_rate_limit }
											name="enforce_rate_limit"
											onChange={ handleOptionChange }
											size="small"
										/>
									}
									label={ __( 'Enforce Rate Limiting', 'blank' ) }
								/>
								<FormHelperText>
									{ __(
										'Apply rate limiting to all routes',
										'blank'
									) }
								</FormHelperText>
							</FormControl>


							<Stack direction={{xs:'column', sm:'row'}} gap={ 2 }>
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
										'Time window for the request limit',
										'blank'
									) }
									name="rate_limit_time"
									value={ firewallOptions.rate_limit_time }
									onChange={ handleOptionChange }
									fullWidth
								/>
							</Stack>

						</Stack>
					</Stack>
				</Stack>

				<Divider sx={ { my: 2 } } />

				<Typography variant="subtitle1" fontWeight={600} sx={ { mb: 2 } }>
					<span>{ __( 'Per Route Settings', 'blank' ) }</span>
					<Tooltip title={ __( 'Refresh routes from server', 'blank' ) }>
						<IconButton onClick={ loadRoutes } disabled={ loading } size="small">
							<RefreshIcon />
						</IconButton>
					</Tooltip>
				</Typography>

				{ loading ? (
					<Stack
						direction="row"
						justifyContent="center"
						alignItems="center"
						sx={ { minHeight: 352 } }
					>
						<LinearProgress />
					</Stack>
				) : (
					<RoutesTree
						treeData={ restRoutes }
						onSettingsChange={ handleTreeChange }
						enforceAuth={ firewallOptions.enforce_auth }
						enforceRateLimit={ firewallOptions.enforce_rate_limit }
						globalRateLimit={ firewallOptions.rate_limit }
						globalRateLimitTime={ firewallOptions.rate_limit_time }
					/>
				) }
			</Stack>
		</Stack>
	);
}
