(async () => {
    if (window.location.host.includes("youtube.com")) {
        const { Hider } = await import(chrome.runtime.getURL('./hider.js'));

        if (Hider.started) return;

        const app = Hider.getInstance(window);
        app.init();
    }
})();