window.blankFlushApplicationCache = function() {
  if (!confirm('Flush Application cache?')) {
    return;
  }
  jQuery.post(blankAdminBar.ajaxurl, { 
    action: blankAdminBar.action, 
    nonce: blankAdminBar.nonce
  }, function(resp) {
    console.log(resp);
    if (resp.success) {
      alert(`${resp.timestamp}:<br/>${resp.message}`);
    } else {
      alert('Error: ' + (resp.data && resp.data.error ? resp.data.error : 'Unknown error'));
    }
 })};