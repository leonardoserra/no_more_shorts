(async () => {
    if (window.location.host.includes("youtube.com")) {
        const { ShortsRemover } = await import(chrome.runtime.getURL('./ShortsRemover.js'));

        if (ShortsRemover.started) return;

        const app = ShortsRemover.getInstance(window);
        app.init();
    }
})();