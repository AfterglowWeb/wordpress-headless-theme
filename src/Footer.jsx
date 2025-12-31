import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { useAdminData } from './contexts/AdminDataContext';

export default function Footer() {
	const { adminData } = useAdminData();

	return (
		<Box
			component="footer"
			sx={ {
				p: { xs: 2, md: 3 },
				borderTop: '1px solid rgba(0, 0, 0, 0.08)',
				background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
				backdropFilter: 'blur(10px)',
				display: 'flex',
				gap: 2,
				justifyContent: 'flex-end',
				alignItems: 'center',
			} }
		>
			<Button size="small" color="primary">
				GPL-V2 License CC BY-SA 4.0
			</Button>
			<Button color="primary" size="small">
				Data privacy
			</Button>
		</Box>
	);
}
