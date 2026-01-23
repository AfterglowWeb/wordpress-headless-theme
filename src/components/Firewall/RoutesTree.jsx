import { useState } from '@wordpress/element';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Tooltip from '@mui/material/Tooltip';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function RoutesTree({ treeData = [] }) {
  const [routes, setRoutes] = useState(treeData);
  
  const onToggle = (uuid, key, value = null) => {
    const update = (nodes) =>
      nodes.map((node) => {
        if (node.uuid === uuid) {
          node.settings = {
            ...node.settings,
            [key]: value !== null ? value : !node.settings?.[key],
          };
        }

        if (node.routes) {
          node.routes = node.routes.map((r) =>
            r.uuid === uuid
              ? {
                  ...r,
                  settings: {
                    ...r.settings,
                    [key]: value !== null ? value : !r.settings?.[key],
                  },
                }
              : r
          );
        }

        if (node.children) node.children = update(node.children);
        return node;
      });

    setRoutes(update(routes));
  };

  return (
    <List>
      {routes.map((node) => (
        <RouteNode
          key={node.id}
          node={node}
          depth={0}
          defaultOpen={false}
          onToggle={onToggle}
        />
      ))}
    </List>
  );
}

function RouteNode({ node, depth, defaultOpen, onToggle }) {
  const { __ } = wp.i18n || {};

  const [openChildren, setOpenChildren] = useState(defaultOpen);
  const [openMethods, setOpenMethods] = useState(false);

  const hasChildren = node.children?.length > 0;
  const hasRoutes = node.routes?.length > 0;

  const applyAll = node.settings?.applyAll ?? true;

  return (
    <>
      <ListItem divider sx={{ pl: depth * 2 }} alignItems="flex-start">
        <Stack spacing={0.5} sx={{ width: '100%' }}>
 
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={node.path} >
                <Typography variant="overline" 
                sx={{
                    width:100, 
                    whiteSpace: 'nowrap', 
                    overflow:'hidden', 
                    textOverflow:'ellipsis'}}>
                    {node.label}
                </Typography>
            </Tooltip>
            <Stack direction="row" 
            spacing={1} 
            alignItems="center"
            sx={{px:3, py:1, justifyContent:'center', backgroundColor:'#dedede', borderRadius:'4px'}}
            >
            <FormControl size="small">
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={node.settings?.protect || false}
                    onChange={() => onToggle(node.uuid, 'protect')}
                  />
                }
                label={<Typography color={'text.secondary'} sx={{ whiteSpace: 'nowrap', fontSize:'12px' }}>
                    {__('Enforce Auth.', 'blank')}
                </Typography>}
              />
            </FormControl>

            <FormControl size="small">
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={!node.settings?.state && node.settings?.disabled}
                    onChange={() => onToggle(node.uuid, 'disable')}
                  />
                }
                label={<Typography color={'text.secondary'} sx={{ whiteSpace: 'nowrap', fontSize:'12px' }}>
                    {__('Disable', 'blank')}
                </Typography>}
              />
            </FormControl>

            <FormControl size="small">
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={applyAll}
                    onChange={(e) =>
                      onToggle(node.uuid, 'applyAll', e.target.checked)
                    }
                  />
                }
                label={<Typography color={'text.secondary'} sx={{ whiteSpace: 'nowrap', fontSize:'12px' }}>
                    {__('Apply to All', 'blank')}
                </Typography>}
              />
            </FormControl>
            </Stack>

            <Stack direction="row" 
            spacing={1} 
            alignItems="center"
            sx={{px:3, py:1, width:400, justifyContent:'flex-end'}}
            >
            <ListItemButton
            onClick={() => true === hasRoutes && setOpenMethods((v) => !v)}
            sx={{ ml: 'auto', minWidth: 36, maxWidth:140, display:'flex', gap:1 }}
            disabled={!hasRoutes}
            >
       
                {true === hasRoutes ? (
                <>
                    <span>{__('Methods','blank')}</span>{openMethods ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </>)
                : (__('No methods','blank'))}
            </ListItemButton>
        
            <ListItemButton
            onClick={() => true === hasChildren && setOpenChildren((v) => !v)}
            sx={{ ml: 'auto', minWidth: 36, maxWidth:140, display:'flex', gap:1 }}
            disabled={!hasChildren}
            >

                {true === hasChildren ? (
                <>
                    <span>{__('Children','blank')}</span>{openChildren ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </>)
                : (__('No children','blank'))}
            </ListItemButton>
            </Stack>

          </Stack>

          {/* Methods */}
          {hasRoutes && (
            <Collapse in={openMethods} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 0.5 }} />
              <NodeRoutes
                node={node}
                applyAll={applyAll}
                onToggle={onToggle}
              />
            </Collapse>
          )}
        </Stack>
      </ListItem>

      {/* Children */}
      {hasChildren && (
        <Collapse in={openChildren} timeout="auto" unmountOnExit>
          <List disablePadding>
            {node.children.map((child) => (
              <RouteNode
                key={child.id}
                node={child}
                depth={depth + 1}
                defaultOpen={false}
                onToggle={onToggle}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

function NodeRoutes({ node, applyAll, onToggle }) {
  return (
    <Stack spacing={0.5} sx={{ pl: 2 }}>
      {HTTP_METHODS.map((method) => {
        const route = node.routes.find((r) => r.method === method);
        if (!route) return null;

        return (
          <RouteSettings
            key={route.uuid}
            method={method}
            route={route}
            disabled={applyAll}
            nodeSettings={node.settings}
            nodePath={node.path}
            nodeLabel={node.label}
            onToggle={onToggle}
          />
        );
      })}
    </Stack>
  );
}

function RouteSettings({ method, route, disabled, nodeSettings, nodePath, nodeLabel, onToggle }) {
    const { __ } = wp.i18n || {};
    const effectiveProtect = disabled
    ? nodeSettings?.protect
    : route.settings?.protect;

  const effectiveDisable = disabled
    ? !nodeSettings?.state && nodeSettings?.disabled
    : !route.settings?.state && route.settings?.disabled;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title={nodePath} >
            <Typography variant="subtitle1" sx={{ width: 120, overflow:'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {nodeLabel}
            </Typography>
            <Typography variant="caption" sx={{ width: 120, overflow:'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {method}
            </Typography>
        </Tooltip>

      <FormControl size="small">
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={!!effectiveProtect}
              disabled={disabled}
              onChange={() => onToggle(route.uuid, 'protect')}
            />
          }
          label={<Typography color={'text.secondary'} sx={{ whiteSpace: 'nowrap', fontSize:'12px' }}>
                    {__('Enforce Auth.', 'blank')}
                </Typography>}
        />
      </FormControl>

      <FormControl size="small">
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={!!effectiveDisable}
              disabled={disabled}
              onChange={() => onToggle(route.uuid, 'disable')}
            />
          }
          label={<Typography color={'text.secondary'} sx={{ whiteSpace: 'nowrap', fontSize:'12px' }}>
                    {__('Disable', 'blank')}
                </Typography>}
        />
      </FormControl>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {route.permission?.type} · {route.permission?.callback}
      </Typography>
    </Stack>
  );
}
