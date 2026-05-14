if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('service-worker.js')
      .then(function(reg) {
        // Service worker registrado
      })
      .catch(function(err) {
        // Falha ao registrar
        console.error('SW registration failed:', err);
      });
  });
}
