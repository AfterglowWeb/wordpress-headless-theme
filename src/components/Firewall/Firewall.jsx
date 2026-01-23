import { useState, useEffect } from '@wordpress/element';
import { useAdminData } from '../../contexts/AdminDataContext';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import RoutesTreeDrawer from './RoutesTreeDrawer';

export default function Firewall() {
	const { adminData } = useAdminData();
	const { __ } = wp.i18n || {};
	const [ restRoutes, setRestRoutes ] = useState(null);
	const [ dialogOpen, setDialogOpen ] = useState( false );

	useEffect( () => {
		const listRestRoutes = async () => {
			const response = await fetch( adminData.ajaxurl, {
				method: 'POST',
				headers: {
					'Content-Type':
						'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: new URLSearchParams( {
					action: 'list_wp_v2_routes',
					nonce: adminData.nonce,
				} ),
			} );

			const result = await response.json();

			if ( result?.success ) {
				setRestRoutes( result.data );
			}
		};

		listRestRoutes();
	}, [ adminData ] );



	return (
		<>
			<Button
				onClick={() => setDialogOpen(true)}
				variant="contained"
				color="primary"
			>
				{ __( 'Firewall Setup', 'blank' ) }
			</Button>

			<Dialog
				open={ dialogOpen }
				onClose={ () => setDialogOpen(false) }
				aria-labelledby="routes-status-dialog-title"
				maxWidth={false}
				fullScreen
				fullWidth
				sx={{
					zIndex:999999
				}}
			>
				<DialogTitle 
				id="routes-status-dialog-title">
					{ __( 'Routes status', 'blank' ) }
				</DialogTitle>
				<DialogContent dividers >
					<RoutesTreeDrawer treeData={restRoutes} />
				</DialogContent>
				<DialogActions>
					<Button
						color="default"
						variant="outlined"
						onClick={() => setDialogOpen(false)}
					>
						{ __( 'Cancel', 'blank' ) }
					</Button>
					<Button
						color="primary"
						variant="contained"
					>
						{ __( 'Save', 'blank' ) }
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}


