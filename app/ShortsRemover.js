export class ShortsRemover {
    static instance = null;
    static started = false;
    static removedCounter = 0;

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
        if (!ShortsRemover.instance){
            ShortsRemover.instance = new ShortsRemover(window);
        }
        return ShortsRemover.instance;
    }

    static infoMessage() {
        let message = `${this.removedCounter}`;

        if (this.removedCounter > 1000) message += " (That's A LOT!)";

        console.info(`Shorts removed for your focus!\nTotal removed in this session: ${message}`);
    }

    init() {
        if (!this.isYouTube()) return;
        this.removeShortsFromPage();
        this.startObserving();

        ShortsRemover.started = true;
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
        const shortsSidebarElements = [];
        const entries = this.document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');

        entries.forEach(entry => {
            if (entry.querySelector('a[title="Shorts"]')) {
                shortsSidebarElements.push(entry);
            }
        });

        return shortsSidebarElements;
    }

    getShortsChipElement() {
        const chipCollection = [];
        this.document
            .querySelectorAll('yt-chip-cloud-chip-renderer chip-shape button div')
            .forEach(chip => {
                if (chip.innerHTML.toLowerCase() == "shorts") {
                    chipCollection.push(chip.closest('yt-chip-cloud-chip-renderer'));
                }
            });

        return chipCollection;
    }

    mergeElementsToRemove(...collections) {
        const elementsToRemove = [];

        collections.forEach(collection => elementsToRemove.push(...collection));

        return elementsToRemove;
    }

    getShortsToRemoveCount(...others) {
        return this.document.body.querySelectorAll(ShortsRemover.selectors.singleShortSelector).length + others.length;
    }
    
    getChameleonShorts(){
        const chameleonShorts = [];

        this.document.querySelectorAll(ShortsRemover.selectors.chameleonShortsChildren)
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
                    ShortsRemover.selectors.homePageShortContainer,
                    ShortsRemover.selectors.shortsContainer,
                    ShortsRemover.selectors.suggestedShortsCarousel,
                    ShortsRemover.selectors.resultsPageShortsContainer
                ].join(',')
            );
            const shortsSidebarElements = this.getShortsSidebarElements();
            const chameleonShorts = this.getChameleonShorts();
            const shortChipElement = this.getShortsChipElement();
            
            const collections = [
                blocksToHide,
                shortsSidebarElements, 
                chameleonShorts, 
                shortChipElement
            ];

            const elementsToRemove = this.mergeElementsToRemove(...collections);

            const individualShortsRemovedCount = this.getShortsToRemoveCount(...chameleonShorts);

            if (elementsToRemove.length) {
                elementsToRemove.forEach(el => el?.remove());
                ShortsRemover.removedCounter += individualShortsRemovedCount;
                if (individualShortsRemovedCount > 0) ShortsRemover.infoMessage();
            }

        } catch (e) {
            console.warn("Error removing shorts:", e);
        }
    }

    startObserving() {
        const debouncedCallback = this.debounce((mutationList, observer) => {
            this.removeShortsFromPage();
        }, 600);

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
