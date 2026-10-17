/* ============================================================
   PRELOADER — Auto hide after 2s + smooth fade out
   Shared across all pages
   ============================================================ */
(function () {
    function initPreloader() {
        var preloader = document.querySelector('.preloader');
        if (!preloader) return;

        // Lock scroll while preloader is visible
        document.body.classList.add('preloader-active');

        function hidePreloader() {
            if (preloader.classList.contains('preloader-hide')) return;

            preloader.classList.add('preloader-hide');
            document.body.classList.remove('preloader-active');

            // Remove from DOM after fade-out finishes
            setTimeout(function () {
                preloader.style.display = 'none';
            }, 600);
        }

        // Hard limit: always hide after 2 seconds
        var preloaderTimer = setTimeout(hidePreloader, 2000);

        // If page loads faster, show for at least 800ms then hide
        window.addEventListener('load', function () {
            clearTimeout(preloaderTimer);
            var elapsed = performance.now();
            var remaining = Math.max(0, Math.min(2000, 800 - elapsed));
            setTimeout(hidePreloader, remaining);
        });

        // Safety net: force hide after 3 seconds no matter what
        setTimeout(hidePreloader, 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPreloader);
    } else {
        initPreloader();
    }
})();