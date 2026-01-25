import { useState, useEffect } from '@wordpress/element';
import { useAdminData } from '../contexts/AdminDataContext';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';

export default function Webhook( { form, setField } ) {
	const { adminData } = useAdminData();

	const { __ } = wp.i18n || {};

	const [ hasSecret, setHasSecret ] = useState( null );
	const [ webhookSecret, setWebhookSecret ] = useState( null );
	const isRevealed = webhookSecret !== null;
	const isLoading = hasSecret === null;

	const [ snackbarOpen, setSnackbarOpen ] = useState( false );
	const [ snackbarSeverity, setSnackbarSeverity ] = useState( '' );
	const [ snackbarContent, setSnackbarContent ] = useState( '' );

	const [ confirmAction, setConfirmAction ] = useState( null ); // 'delete' | 'regenerate' | null
	const confirmOpen = Boolean( confirmAction );

	useEffect( () => {
		const checkSecret = async () => {
			const response = await fetch( adminData.ajaxurl, {
				method: 'POST',
				headers: {
					'Content-Type':
						'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: new URLSearchParams( {
					action: 'has_application_webhook_secret',
					nonce: adminData.nonce,
				} ),
			} );

			const result = await response.json();

			if ( result?.success ) {
				setHasSecret( Boolean( result.data.has_secret ) );
				setWebhookSecret( null );
			}
		};

		checkSecret();
	}, [ adminData ] );

	const regenerateWebhookSecret = async () => {
		const response = await fetch( adminData.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: new URLSearchParams( {
				action: 'update_application_webhook_secret',
				nonce: adminData.nonce,
			} ),
		} );

		const result = await response.json();

		if ( result?.success ) {
			setWebhookSecret( result.data.secret ); // 👈 reveal now
			setHasSecret( true );

			setSnackbarOpen( true );
			setSnackbarSeverity( 'success' );
			setSnackbarContent(
				__(
					'Application webhook secret generated successfully.',
					'blank'
				)
			);
		}
	};

	const deleteWebhookSecret = async () => {
		const response = await fetch( adminData.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: new URLSearchParams( {
				action: 'delete_application_webhook_secret',
				nonce: adminData.nonce,
			} ),
		} );

		const result = await response.json();

		if ( result?.success ) {
			setWebhookSecret( null );
			setHasSecret( false );

			setSnackbarOpen( true );
			setSnackbarSeverity( 'success' );
			setSnackbarContent( result.data.message || '' );
		}
	};

	const confirmConfig = {
		delete: {
			title: __( 'Revoke Webhook Secret', 'blank' ),
			content: __(
				'Any applications using this webhook secret will stop working. Continue?',
				'blank'
			),
			action: deleteWebhookSecret,
		},
		regenerate: {
			title: __( 'Regenerate Webhook Secret', 'blank' ),
			content: __(
				'Regenerating the webhook secret will invalidate the current one. Any applications using the old secret will stop working. Continue?',
				'blank'
			),
			action: regenerateWebhookSecret,
		},
	};

	const handleConfirm = async () => {
		if ( ! confirmAction ) {
			return;
		}
		await confirmConfig[ confirmAction ].action();
		setConfirmAction( null );
	};

	return (
		<Stack>
			<Typography variant="h6" sx={ { fontWeight: 600 } }>
				{ __( 'Application Webhook', 'blank' ) }
			</Typography>
			
			<Box py={ 3 }>
			<TextField
				label={ __( 'Application URL', 'blank' ) }
				name="application_host"
				helperText={ __(
					'Full application URL with protocol and port (e.g., https://example.local:5001).',
					'blank'
				) }
				value={ form.application_host }
				onChange={ setField }
				fullWidth
			/>
			</Box>
			<Box py={ 3 }>
			<TextField
				label={ __( 'Application Webhook Endpoint', 'blank' ) }
				name="application_webhook_endpoint"
				helperText={ __(
					'The application endpoint used to trigger a webhook.',
					'blank'
				) }
				value={ form.application_webhook_endpoint }
				onChange={ setField }
				fullWidth
			/>
			</Box>


			<Box mt={ 2 }>
				<Stack spacing={ 1.5 }>
					<TextField
						label={ __( 'Application Webhook Secret', 'blank' ) }
						value={
							isLoading
								? __( 'Checking…', 'blank' )
								: ! hasSecret
								? __( 'Not generated', 'blank' )
								: isRevealed
								? webhookSecret
								: '••••••••••••••••••••••••••••••••'
						}
						type={ isRevealed ? 'text' : 'password' }
						disabled={ false }
						slotProps={ {
							input: {
								readOnly: true,
								endAdornment: isRevealed && (
									<InputAdornment position="end">
										<IconButton
											onClick={ () =>
												navigator.clipboard.writeText(
													webhookSecret
												)
											}
										>
											<ContentCopyIcon fontSize="small" />
										</IconButton>
									</InputAdornment>
								),
							},
						} }
						helperText={
							! hasSecret
								? __(
										'No webhook secret generated yet.',
										'blank'
								  )
								: __(
										'Used to sign webhook requests.',
										'blank'
								  )
						}
						fullWidth
					/>

					{ isRevealed && (
						<Alert severity="info">
							{ __(
								'This secret is shown only once. Copy it now and store it securely.',
								'blank'
							) }
						</Alert>
					) }

					<Alert severity="info">
						{ __(
							'You can edit the webhook payload through the "blank_application_webhook_body_payload" filter hook.',
							'blank'
						) }
					</Alert>

					<Stack
						direction="row"
						spacing={ 2 }
						sx={ { justifyContent: 'flex-end' } }
					>
						<Button
							variant="outlined"
							startIcon={ <DeleteOutlineIcon /> }
							onClick={ () => setConfirmAction( 'delete' ) }
							disabled={ ! hasSecret }
						>
							{ __( 'Revoke Secret', 'blank' ) }
						</Button>

						<Button
							variant="contained"
							startIcon={ <AutorenewIcon /> }
							onClick={ () => setConfirmAction( 'regenerate' ) }
						>
							{ __( 'Regenerate Secret', 'blank' ) }
						</Button>
					</Stack>
				</Stack>
			</Box>

			<Dialog
				open={ confirmOpen }
				onClose={ () => setConfirmAction( null ) }
				aria-labelledby="confirm-dialog-title"
				maxWidth="xs"
			>
				<DialogTitle id="confirm-dialog-title">
					{ confirmAction && confirmConfig[ confirmAction ].title }
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{ confirmAction &&
							confirmConfig[ confirmAction ].content }
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={ () => setConfirmAction( null ) }
						variant="outlined"
					>
						{ __( 'Cancel', 'blank' ) }
					</Button>

					<Button onClick={ handleConfirm } variant="contained">
						{ __( 'Confirm', 'blank' ) }
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={ snackbarOpen }
				autoHideDuration={ 5000 }
				onClose={ () => setSnackbarOpen( false ) }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
			>
				<Alert
					onClose={ () => setSnackbarOpen( false ) }
					severity={ snackbarSeverity }
					sx={ { width: '100%' } }
				>
					{ snackbarContent }
				</Alert>
			</Snackbar>
		</Stack>
	);
}
