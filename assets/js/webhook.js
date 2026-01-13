window.blankTriggerWebhook = function(e) {
  if (!confirm(blankWebhookService.confirmMessage)) {
    return;
  }
  jQuery.post(blankWebhookService.ajaxurl, { 
    action: 'trigger_application_webhook', 
    nonce: blankWebhookService.nonce
  }, function(response) {
    if (response.success && response.data ) {
      alert(`Success:\n${response.data.message} at ${response.data.timestamp}`);
    } else {
      alert('Error: ' + (response.data && response.data.error ? response.data.error : 'Unknown error'));
    }
})};