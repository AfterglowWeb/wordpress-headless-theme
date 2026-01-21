import { useEffect, useState } from '@wordpress/element';
import { useModels } from '../../contexts/ModelsContext';

import {
	Box,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Stack,
	Typography,
	Switch,
	TextField,
	FormControlLabel,
	Select,
	MenuItem,
} from '@mui/material';

export default function Models() {
	const { state, loadSchemas, saveModel, deleteModel } = useModels();
	const { __ } = wp.i18n || {};

	const [ dialogOpen, setDialogOpen ] = useState( false );
	const [ restType, setRestType ] = useState( '' );
	const [ fields, setFields ] = useState( [] );

	useEffect( () => {
		loadSchemas();
	}, [] );

	const updateField = ( index, key, value ) => {
		setFields( ( prev ) => {
			const next = [ ...prev ];
			next[ index ] = { ...next[ index ], [ key ]: value };
			return next;
		} );
	};

	const handleSave = () => {
		if ( ! restType ) {
			return;
		}
		const schema =
			state.schemas.post_types_schemas?.[ restType ] ||
			state.schemas.taxonomies_schemas?.[ restType ];

		if ( ! schema ) {
			return;
		}

		const model = {
			uuid: restType,
			kind: schema.kind,
			label: schema.label,
			fields,
		};

		saveModel( model );
		setDialogOpen( false );
	};

	const handleDelete = () => {
		if ( restType ) {
			deleteModel( restType );
		}
		setDialogOpen( false );
	};

	const schemaOptions = [
		...Object.entries( state.schemas.post_types_schemas || {} ).map(
			( [ value, schema ] ) => ( {
				value,
				label: schema.label,
				kind: schema.kind,
			} )
		),
		...Object.entries( state.schemas.taxonomies_schemas || {} ).map(
			( [ value, schema ] ) => ( {
				value,
				label: schema.label,
				kind: schema.kind,
			} )
		),
	];

	useEffect( () => {
		if ( ! restType ) {
			return;
		}

		const schema =
			state.schemas.post_types_schemas?.[ restType ] ||
			state.schemas.taxonomies_schemas?.[ restType ];

		setFields( schema ? Object.values( schema.fields ) : [] );
	}, [ restType, state.schemas ] );

	return (
		<>
			<Button variant="outlined" onClick={ () => setDialogOpen( true ) }>
				{ __( 'Map REST fields', 'blank' ) }
			</Button>

			<Dialog
				open={ dialogOpen }
				onClose={ () => setDialogOpen( false ) }
				fullWidth
				maxWidth="md"
			>
				<DialogTitle>
					{ __( 'Model – Field Mapping', 'blank' ) }
				</DialogTitle>

				<DialogContent dividers>
					<Stack spacing={ 3 }>
						{ /* REST type selector */ }
						<Select
							value={ restType }
							onChange={ ( e ) => setRestType( e.target.value ) }
							displayEmpty
						>
							<MenuItem value="">
								<em>
									{ __(
										'Select post type / taxonomy',
										'blank'
									) }
								</em>
							</MenuItem>

							{ schemaOptions.map( ( opt ) => (
								<MenuItem key={ opt.value } value={ opt.value }>
									{ opt.label }{ ' ' }
									{ opt.kind === 'taxonomy'
										? '(taxonomy)'
										: '' }
								</MenuItem>
							) ) }
						</Select>

						{ /* Fields list */ }
						{ fields.map( ( field, index ) => (
							<Box
								key={ field.original_key }
								sx={ {
									border: '1px solid #ddd',
									borderRadius: 1,
									p: 2,
								} }
							>
								<Stack spacing={ 2 }>
									<Typography variant="subtitle2">
										{ field.original_key } ({ field.type })
									</Typography>

									<Stack direction="row" spacing={ 2 }>
										<FormControlLabel
											control={
												<Switch
													checked={ field.active }
													onChange={ ( e ) =>
														updateField(
															index,
															'active',
															e.target.checked
														)
													}
												/>
											}
											label={ __(
												'Expose in REST',
												'blank'
											) }
										/>

										<FormControlLabel
											control={
												<Switch
													checked={ Boolean(
														field.parse_callback
													) }
													onChange={ ( e ) =>
														updateField(
															index,
															'parse_callback',
															e.target.checked
																? 'resolve'
																: ''
														)
													}
												/>
											}
											label={ __(
												'Resolve / Embed',
												'blank'
											) }
										/>
									</Stack>

									<Stack direction="row" spacing={ 2 }>
										<TextField
											label={ __(
												'Sanitize callback',
												'blank'
											) }
											value={ field.sanitize_callback }
											size="small"
											fullWidth
											disabled
										/>
										<TextField
											label={ __(
												'Parse callback',
												'blank'
											) }
											value={ field.parse_callback }
											size="small"
											fullWidth
											disabled
										/>
									</Stack>
								</Stack>
							</Box>
						) ) }
					</Stack>
				</DialogContent>

				<DialogActions>
					<Button variant="outlined">
						{ __( 'Apply to all endpoints', 'blank' ) }
					</Button>
					<Button variant="outlined" disabled>
						{ __( 'Apply to selected endpoints', 'blank' ) }
					</Button>

					<Box sx={ { flexGrow: 1 } } />

					<Button color="error" onClick={ handleDelete }>
						{ __( 'Delete', 'blank' ) }
					</Button>

					<Button onClick={ () => setDialogOpen( false ) }>
						{ __( 'Cancel', 'blank' ) }
					</Button>

					<Button variant="contained" onClick={ handleSave }>
						{ __( 'Save', 'blank' ) }
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
