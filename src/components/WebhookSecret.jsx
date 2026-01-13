import { useState, useEffect } from '@wordpress/element';
import { useAdminData } from '../contexts/AdminDataContext';

import {
	Box,
	TextField,
	Button,
	Stack,
	IconButton,
	InputAdornment,
	Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';

export default function WebhookSecret({form, setField}) {
    const { adminData } = useAdminData();

    const { __ } = wp.i18n || {};
    const [webhookSecret, setWebhookSecret] = useState(null);

    const regenerateWebhookSecret = async () => {
        const _response = await fetch(adminData.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: new URLSearchParams({
				action: 'update_application_webhook_secret',
				nonce: adminData.nonce
			}),
		});

		const response = await _response.json();
        if(response && response.data) {
            setWebhookSecret(response.data.secret);
            setField('application_webhook_secret_generated', true);
        }

    };

    return (
    <Box mt={2}>
        <Stack spacing={1.5}>
            <TextField
                label={__('Webhook Secret', 'blank')}
                value={!webhookSecret && form.application_webhook_secret_generated
                            ? '••••••••••••••••••••••••'
                            : ( webhookSecret ? webhookSecret : __('Not generated', 'blank') )
                }
                type={webhookSecret ? 'text' : 'password'}
                slotProps={{
                    input:{
                        readOnly: true,
                        endAdornment: webhookSecret && (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={__('Copy webhook secret', 'blank')}
                                    onClick={() => {
                                        navigator.clipboard.writeText(webhookSecret);
                                    }}
                                    edge="end"
                                >
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }
                }}
                helperText={__(
                    'Used to sign webhook requests. Store this value securely in your application environment.',
                    'blank'
                )}
                fullWidth
            />

            {webhookSecret && (
                <Alert severity="warning">
                    {__(
                        'This secret is shown only once. Copy it now and store it securely. You will not be able to view it again.',
                        'blank'
                    )}
                </Alert>
            )}

            <Button
                variant="outlined"
                color="warning"
                startIcon={<AutorenewIcon />}
                onClick={() => {
                    if (
                        !window.confirm(
                            __(
                                'Regenerating the webhook secret will invalidate the current one. Any applications using the old secret will stop working. Continue?',
                                'blank'
                            )
                        )
                    ) {
                        return;
                    }

                    regenerateWebhookSecret();
                }}
            >
                {__('Regenerate Webhook Secret', 'blank')}
            </Button>
        </Stack>
    </Box>);
}