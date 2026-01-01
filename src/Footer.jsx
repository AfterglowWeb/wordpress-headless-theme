import { Button, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import { useAdminData } from './contexts/AdminDataContext';

export default function Footer() {
	const { adminData } = useAdminData();

	return (
		<Box
			component="footer"
			sx={ {
				px: { xs: 2, md: 3 },
				py:1,
				borderTop: '1px solid rgba(0, 0, 0, 0.08)',
				background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
				backdropFilter: 'blur(10px)',
				display: 'flex',
				gap: 2,
				justifyContent: 'flex-end',
				alignItems: 'center',
			} }
		>
			<Tooltip title={'Open in a new tab'}>
			<Button size="small" color="primary" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="nofollow noreferer noopener">
				GPL-V2 License CC BY-SA 4.0
			</Button>
			</Tooltip>
			<Button color="primary" size="small">
				Data privacy
			</Button>
		</Box>
	);
}
