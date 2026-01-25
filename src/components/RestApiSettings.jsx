import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Firewall from './Firewall/Firewall';

export default function RestApiSettings() {
	const { __ } = wp.i18n || {};

	return (
		<Stack spacing={ 3 }>
			<Typography variant="h6" sx={ { fontWeight: 600 } }>
				{ __( 'Security', 'blank' ) }
			</Typography>

			<Firewall />
		</Stack>
	);
}
