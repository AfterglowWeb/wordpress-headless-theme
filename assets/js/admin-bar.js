window.blankFlushApplicationCache = function() {
  if (!confirm('Flush Application cache?')) {
    return;
  }
  jQuery.post(blankAdminBar.ajaxurl, { 
    action: blankAdminBar.action, 
    nonce: blankAdminBar.nonce
  }, function(response) {
   
    if (response.success && response.data ) {
      alert(`Success:\n${response.data.message} at ${response.data.timestamp}`);
    } else {
      alert('Error: ' + (response.data && response.data.error ? response.data.error : 'Unknown error'));
    }
 })};