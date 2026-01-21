import React, { useState, useMemo } from 'react';
import { Box, Grid, TextField, Typography, Paper } from '@mui/material';
import TransferList from './TransferList';

export default function ModelEditor( { model, sample } ) {
	const [ fields, setFields ] = useState( model );

	const active = fields.filter( ( f ) => f.active );
	const inactive = fields.filter( ( f ) => ! f.active );

	const handleToggle = ( updatedActive, updatedInactive ) => {
		setFields( [ ...updatedActive, ...updatedInactive ] );
	};

	const updateField = ( originalKey, prop, value ) => {
		setFields( ( fields ) =>
			fields.map( ( field ) =>
				field.original_key === originalKey
					? { ...field, [ prop ]: value }
					: field
			)
		);
	};

	return (
		<Grid container spacing={ 3 }>
			<Grid item xs={ 12 } md={ 5 }>
				<TransferList
					active={ active }
					inactive={ inactive }
					onChange={ handleToggle }
				/>
			</Grid>

			<Grid item xs={ 12 } md={ 7 }>
				<Typography variant="h6" gutterBottom>
					Active Fields
				</Typography>

				{ active.map( ( field ) => (
					<Paper key={ field.original_key } sx={ { p: 2, mb: 2 } }>
						<Typography variant="subtitle2" gutterBottom>
							{ field.original_key }
						</Typography>

						<Box display="flex" gap={ 2 }>
							<TextField
								label="New key"
								value={ field.key }
								onChange={ ( e ) =>
									updateField(
										field.original_key,
										'key',
										e.target.value
									)
								}
								fullWidth
							/>

							<TextField
								label="Sanitize callback"
								value={ field.sanitize_callback }
								onChange={ ( e ) =>
									updateField(
										field.original_key,
										'sanitize_callback',
										e.target.value
									)
								}
								fullWidth
							/>

							<TextField
								label="Parse callback"
								value={ field.parse_callback }
								onChange={ ( e ) =>
									updateField(
										field.original_key,
										'parse_callback',
										e.target.value
									)
								}
								fullWidth
							/>
						</Box>

						{ sample?.[ field.original_key ] !== undefined && (
							<Typography
								variant="caption"
								sx={ { mt: 1, display: 'block', opacity: 0.7 } }
							>
								Sample:{ ' ' }
								{ JSON.stringify(
									sample[ field.original_key ]
								).slice( 0, 80 ) }
								…
							</Typography>
						) }
					</Paper>
				) ) }
			</Grid>
		</Grid>
	);
}
