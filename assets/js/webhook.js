window.blankFlushApplicationCache = function(e) {
  if (!confirm('Flush Application cache?')) {
    return;
  }
  jQuery.post(blankWebhookService.ajaxurl, { 
    action: 'flush_application_cache', 
    nonce: blankWebhookService.nonce
  }, function(response) {
    if (response.success && response.data ) {
      alert(`Success:\n${response.data.message} at ${response.data.timestamp}`);
    } else {
      alert('Error: ' + (response.data && response.data.error ? response.data.error : 'Unknown error'));
    }
})};