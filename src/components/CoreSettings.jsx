import { useTheme } from '@mui/material/styles';

import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function CoreSettings( { form, setField, setSlider } ) {
	const { __ } = wp.i18n || {};
	const theme = useTheme();

	const valueLabelFormat = ( value ) =>
		value >= 1024 ? `${ value / 1024 } MB` : `${ value } KB`;

	return (
		<Stack spacing={ 3 }>
			<Typography variant="h6" sx={ { fontWeight: 600 } }>
				{ __( 'Core options', 'blank' ) }
			</Typography>
			
			<FormControl>
				<FormControlLabel
					control={
						<Switch
							checked={
								!! form.core_disable_gutenberg_enabled
							}
							name="core_disable_gutenberg_enabled"
							onChange={ setField }
						/>
					}
					label={ __( 'Disable Gutenberg', 'blank' ) }
				/>
				<FormHelperText>{ __( 'Use WordPress legacy editor on exposed post types', 'blank' ) }</FormHelperText>
			</FormControl>
			
			<FormControl>
				<FormControlLabel
					control={
						<Switch
							checked={
								!! form.core_disable_comments_enabled
							}
							name="core_disable_comments_enabled"
							onChange={ setField }
						/>
					}
					label={ __( 'Disable Comments', 'blank' ) }
				/>
				<FormHelperText>{ __( 'Deactivate comments site wide', 'blank' ) }</FormHelperText>
			</FormControl>

			<Box sx={ { px: 1.5 } }>
				<FormControl>

					<Stack direction={ { xs: 'column', sm: 'row' } }>
						<FormControlLabel
							control={
								<Switch
									checked={
										!! form.core_max_upload_size_enabled
									}
									name="core_max_upload_size_enabled"
									onChange={ setField }
								/>
							}
							label={ __(
								'Limit Images Weight',
								'blank'
							) }
						/>
						<Typography
							sx={ {
								display: 'flex',
								alignItems: 'center',
								mb: 0,
							} }
							color={
								form.core_max_upload_size_enabled
									? theme.palette.primary.main
									: theme.palette.text.disabled
							}
							id="max-upload-size-slider"
							gutterBottom
						>
							{ __( 'Max Images Upload Size', 'blank' ) } :{ ' ' }
							{ valueLabelFormat(
								form.core_max_upload_size
							) }
						</Typography>
					</Stack>

					<Slider
						value={ form.core_max_upload_size }
						min={ 1 }
						max={ 1024 }
						step={ 1 }
						disabled={ ! form.core_max_upload_size_enabled }
						getAriaValueText={ valueLabelFormat }
						valueLabelFormat={ valueLabelFormat }
						onChange={ ( _, value ) =>
							setSlider( 'core_max_upload_size', value )
						}
						valueLabelDisplay="auto"
						aria-labelledby="max-upload-size-slider"
					/>

					<FormHelperText>
						{ __(
							'Limit the weight of images users can upload.',
							'blank'
						) }
					</FormHelperText>

				</FormControl>
			</Box>
		</Stack>
	);
}
