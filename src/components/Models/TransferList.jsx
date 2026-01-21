import React from 'react';
import {
	Grid,
	List,
	ListItem,
	ListItemText,
	Paper,
	Button,
} from '@mui/material';

export default function TransferList( { active, inactive, onChange } ) {
	const move = ( item, from, to ) => {
		const newFrom = from.filter(
			( f ) => f.original_key !== item.original_key
		);
		const newTo = [ ...to, { ...item, active: ! item.active } ];
		onChange(
			newTo.filter( ( f ) => f.active ),
			newFrom.filter( ( f ) => ! f.active )
		);
	};

	const renderList = ( items, isActive ) => (
		<Paper sx={ { width: '100%', height: 400, overflow: 'auto' } }>
			<List dense>
				{ items.map( ( item ) => (
					<ListItem
						key={ item.original_key }
						button
						onClick={ () =>
							move(
								item,
								isActive ? active : inactive,
								isActive ? inactive : active
							)
						}
					>
						<ListItemText primary={ item.original_key } />
					</ListItem>
				) ) }
			</List>
		</Paper>
	);

	return (
		<Grid container spacing={ 2 }>
			<Grid item xs={ 6 }>
				<Typography>Inactive</Typography>
				{ renderList( inactive, false ) }
			</Grid>
			<Grid item xs={ 6 }>
				<Typography>Active</Typography>
				{ renderList( active, true ) }
			</Grid>
		</Grid>
	);
}
