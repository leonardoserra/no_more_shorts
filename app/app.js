class App {
    static hiddenCounter = 0;

    static selectors = {
        homePageShort: "div [is-shorts]",
        shortsContainer: "#shorts-inner-container",
        suggestedShortsCarousel: "ytd-reel-shelf-renderer",
        singleShortSelector: "ytm-shorts-lockup-view-model, div [is-shorts], ytd-reel-video-renderer"
    };

    constructor(window) {
        this.window = window;
        this.document = window.document;
        this.redirecting = false;
    }

    static infoMessage() {
        console.info(`Shorts removed for your focus!\nTotal removed in this session: ${this.hiddenCounter}`);
    }

    init() {
        if (!this.isYouTube()) return;
        this.removeShortsFromPage();
        this.startObserving();
    }

    isYouTube() {
        return this.document.location.host.includes("youtube.com");
    }

    redirectIfOnShortsPage() {
        if (this.document.location.pathname.startsWith('/shorts')) {
            if (!this.redirecting) {
                this.redirecting = true;
                setTimeout(() => {
                    this.window.location.replace('https://www.youtube.com');
                }, 1000);
            }
        }
    }

    findShortsSidebarElements() {
        let shortsNavbarElement = [];
        const entries = this.document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');

        entries.forEach(entry => {
            if (entry.querySelector('a[title="Shorts"]')) {
                shortsNavbarElement.push(entry);
            }
        });

        return shortsNavbarElement;
    }

    collectElementsToRemove(blocksToHide, shortsNavbarElement) {
        return [
            ...(blocksToHide || []), 
            ...(shortsNavbarElement || []) 
        ];
    }

    getShortsToDeleteCount() {
        return this.document.body.querySelectorAll(App.selectors.singleShortSelector).length;
    }

    removeShortsFromPage() {
        this.redirectIfOnShortsPage();

        try {
            const blocksToHide = this.document.body.querySelectorAll(
                [
                    App.selectors.homePageShort,
                    App.selectors.shortsContainer,
                    App.selectors.suggestedShortsCarousel
                ].join(',')
            );

            const shortsNavbarElement = this.findShortsSidebarElements();
            const elementsToRemove = this.collectElementsToRemove(blocksToHide, shortsNavbarElement);

            const removedCount = this.getShortsToDeleteCount();

            if (elementsToRemove.length) {
                elementsToRemove.forEach(el => el?.remove());
                App.hiddenCounter += removedCount;
                if (removedCount > 0) App.infoMessage();
            }

        } catch (e) {
            console.warn("Error removing shorts:", e);
        }
    }

    startObserving() {
        const debouncedCallback = this.debounce((mutationList, observer) => {
            this.removeShortsFromPage();
        }, 300);

        try {
            this.observer = new MutationObserver(debouncedCallback);
            this.observer.observe(this.document, {
                childList: true,
                subtree: true,
            });
        } catch (e) {
            console.warn("Failed to start observer:", e);
        }
    }

    debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
}

if (window.location.host.includes("youtube.com")) {
    const app = new App(window);
    app.init();
}
