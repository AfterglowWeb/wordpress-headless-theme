import { useState } from '@wordpress/element';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const drawerWidth = 340;

export default function RoutesTreeDrawer({ treeData = [] }) {
    const { __ } = wp.i18n || {};
    const [routes, setRoutes] = useState(treeData);

    const [drawerStack, setDrawerStack] = useState([
    { depth: 0, nodes: treeData || [], parentId: null, parentLabel: null },
    ]);

    const openChildDrawer = (depth, node) => {
    if (!node.children || node.children.length === 0) return;

    setDrawerStack((prev) => {
        const truncated = prev.slice(0, depth + 1);

        const last = truncated[truncated.length - 1];
        if (last?.parentId === node.id) {
        return truncated;
        }

        return [
        ...truncated,
        {
            depth: depth + 1,
            nodes: node.children,
            parentId: node.id,
            parentLabel: node.label,
        },
        ];
    });
    };

    const closeDrawer = (depth) => {
    setDrawerStack((prev) => prev.slice(0, depth + 1));
    };

    const handleRouteToggle = (uuid, key) => {
        if (onToggle) onToggle(uuid, key);
    };

  	const onToggle = (uuid) => {
		const updateNode = (nodes) =>
		nodes.map((node) => {
			if (node.routes) {
			node.routes = node.routes.map((r) =>
				r.uuid === uuid
				? { ...r, settings: { ...r.settings, state: !r.settings.state } }
				: r
			);
			}
			if (node.children) node.children = updateNode(node.children);
			return node;
		});

		setRoutes(updateNode(routes));
	};

  return (
    <>
      {drawerStack.map((drawer, idx) => (
        <Drawer
          key={idx}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              left: drawerWidth * idx, // position drawers next to each other
            },
          }}
          variant="persistent"
          anchor="left"
          open
        >
            <Toolbar>
                {drawer.parentLabel && idx > 0 ? (
                    <Button onClick={() => closeDrawer(idx - 1)}>
                    ← Back to {drawer.parentLabel}
                    </Button>
                ) : <Typography
                variant='h6'
                >
{__('REST API Protect routes','blank')}
                </Typography>}
            </Toolbar>

          <Box sx={{ p: 1 }}>
            

            <List>
              {(drawer.nodes || []).map((node) => {
                const childrenCount = node.children?.length || 0;

                return (
                  <ListItem
                  disablePadding
                  disableGutters
                  alignItems="flex-start"
                  dense
                  divider
                   key={node.id}>
                        <ListItemText 
                        primary={node.label}
                        secondary={
                            <>
                            {node.routes && node.routes.length > 0 && (
                                <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                                    {HTTP_METHODS.map((method) => {
                                    const route = node.routes.find((r) => r.method === method);
                                    const isAvailable = !!route;

                                    if( ! isAvailable ) {
                                        return null;
                                    }

                                    return (
                                        <Stack
                                        key={method}
                                        direction="row"
                                        spacing={0.5}
                                        alignItems="flex-start"
                                        >
                                        <Typography
                                            variant="subtitle.2"
                                            sx={{ py:'2px',width: 40, color: isAvailable ? 'text.primary' : 'grey.400' }}
                                        >
                                            {method}
                                        </Typography>

            
                                            <FormControl>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                        checked={route?.settings?.protect || false}
                                                        disabled={!isAvailable}
                                                        size="small"
                                                        onChange={() => route && handleRouteToggle(route.uuid, 'protect')}
                                                        />
                                                    }
                                                    label={ __( 'Auth', 'blank' ) }
                                                />
                                            </FormControl>
                                        

                                            <FormControl>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                checked={route ? !route.settings.state && route.settings.disabled : false}
                                                        disabled={!isAvailable}
                                                        size="small"
                                                onChange={() => route && handleRouteToggle(route.uuid, 'disable')}
                                                        />
                                                    }
                                                    label={ __( 'Disable', 'blank' ) }
                                                />
    
                                            </FormControl>
                                        </Stack>
                                    );
                                    })}
                                </Stack>
                                )}
                            </>
                            }
                            />

                            <ListItemButton
                            onClick={() => openChildDrawer(idx, node)}
                            disabled={childrenCount === 0}
                            >
                                <ListItemIcon>  
                                    <span>{childrenCount > 1 ? `${childrenCount} routes` : (childrenCount === 0 ? 'No routes' : `${childrenCount} route`)}</span>
                                    <ArrowForwardIosIcon fontSize="small" />
                                </ListItemIcon>
                            </ListItemButton>
                    

                  </ListItem>
                );
              })}
            </List>
          </Box>

          <Divider />
        </Drawer>
      ))}
    </>
  );
}
