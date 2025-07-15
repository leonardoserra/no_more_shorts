export class Hider {
    static instance = null;
    static started = false;
    static hiddenCounter = 0;

    static selectors = {
        homePageShortContainer: "div [is-shorts]",
        resultsPageShortsContainer: "grid-shelf-view-model",
        shortsContainer: "#shorts-inner-container",
        suggestedShortsCarousel: "ytd-reel-shelf-renderer",
        chameleonShortsChildren: 'a[href^="/shorts"], badge-shape[aria-label="Shorts"]',
        singleShortSelector: "ytm-shorts-lockup-view-model, ytd-reel-video-renderer"
    };

    constructor(window) {
        this.window = window;
        this.document = window.document;
        this.redirecting = false;
    }

    static getInstance(window){
        if (!Hider.instance){
            Hider.instance = new Hider(window);
        }
        return Hider.instance;
    }

    static infoMessage() {
        console.info(`Shorts removed for your focus!\nTotal removed in this session: ${this.hiddenCounter}`);
    }

    init() {
        if (!this.isYouTube()) return;
        this.removeShortsFromPage();
        this.startObserving();

        Hider.started = true;
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

    getShortsSidebarElements() {
        let shortsSidebarElements = [];
        const entries = this.document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');

        entries.forEach(entry => {
            if (entry.querySelector('a[title="Shorts"]')) {
                shortsSidebarElements.push(entry);
            }
        });

        return shortsSidebarElements;
    }

    mergeElementsToRemove(...args) {
        const elementsToRemove = [];

        args.forEach(collection => elementsToRemove.push(...collection));

        return elementsToRemove;
    }

    getShortsToDeleteCount() {
        return this.document.body.querySelectorAll(Hider.selectors.singleShortSelector).length;
    }
    
    getChameleonShorts(){
        const chameleonShorts = [];

        this.document.querySelectorAll(Hider.selectors.chameleonShortsChildren)
            .forEach(el => {
                const chameleonShort = el.closest('ytd-video-renderer');
                if (chameleonShort) {
                    chameleonShorts.push(chameleonShort);
                }
            });

        return chameleonShorts;
    }

    removeShortsFromPage() {
        this.redirectIfOnShortsPage();

        try {
            const blocksToHide = this.document.body.querySelectorAll(
                [
                    Hider.selectors.homePageShortContainer,
                    Hider.selectors.shortsContainer,
                    Hider.selectors.suggestedShortsCarousel,
                    Hider.selectors.resultsPageShortsContainer
                ].join(',')
            );

            const shortsSidebarElements = this.getShortsSidebarElements();
            const chameleonShorts = this.getChameleonShorts();

            const elementsToRemove = this.mergeElementsToRemove(blocksToHide, shortsSidebarElements, chameleonShorts);

            const removedCount = this.getShortsToDeleteCount();

            if (elementsToRemove.length) {
                elementsToRemove.forEach(el => el?.remove());
                Hider.hiddenCounter += removedCount;
                if (removedCount > 0) Hider.infoMessage();
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
