/**
 * Released under MIT License
 * 
 * Copyright (c) 2025 Leonardo Serra.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, andor sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export class ShortsRemover {
    static instance = null;
    static started = false;

    static selectors = {
        homePageShortContainer: "div [is-shorts]",
        resultsPageShortsContainer: "grid-shelf-view-model",
        shortSidebarElements: "ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer",
        shortsContainer: "#shorts-inner-container",
        anchorWithShortsTitle: "a[title='Shorts']",
        suggestedShortsCarousel: "ytd-reel-shelf-renderer",
        notificationShortItem: "ytd-notification-renderer a[href^='/shorts']",
        notificationShortContainer: "ytd-notification-renderer",
        chameleonShortsContainer: "ytd-video-renderer",
        chameleonShortsChildren: "badge-shape[aria-label='Shorts']",
        channelShortsChip: "yt-tab-shape[tab-title='Shorts']",
        navbarChipContainer: "yt-chip-cloud-chip-renderer chip-shape button div",
        innerNavbarChipContainer: "yt-chip-cloud-chip-renderer",
        singleShortSelector: "ytm-shorts-lockup-view-model, ytd-reel-video-renderer"
    };

    constructor(window) {
        this.window = window;
        this.document = window.document;
        this.redirecting = false;
        this.removedCounter = 0;
    }

    static getInstance(window) {
        if (!ShortsRemover.instance) {
            ShortsRemover.instance = new ShortsRemover(window);
        }
        return ShortsRemover.instance;
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

    isShortsPage() {
        return this.document.location.pathname.startsWith("/shorts");
    }

    isHistoryPage(){
        return this.document.location.pathname.includes("/feed/history");
    }

    isChannelShortsPage() {
        return this.document.location.pathname.endsWith("/shorts");
    }

    infoMessage() {
        let message = `${this.removedCounter}`;

        if (this.removedCounter > 1000) message += " (That's A LOT!)";

        console.info(`Shorts removed for your focus!\nTotal removed in this session: ${message}`);
    }

    onForbiddenPage() {
        return this.isShortsPage() || this.isChannelShortsPage();
    }

    goBackHome() {
        if (this.isShortsPage())
            this.redirectHandler(this.setHomePageLocation.bind(this));
        else if (this.isChannelShortsPage())
            this.redirectHandler(this.setChannelSectionLocation.bind(this));
    }

    redirectHandler(location) {
        if (!this.redirecting) {
            this.redirecting = true;
            setTimeout(() => {
                location();
            }, 1000);
        }
    }

    setHomePageLocation() {
        this.window.location.replace("https://www.youtube.com");
    }

    setChannelSectionLocation() {
        const path = this.document.location.pathname;
        const url = path.replace("/shorts", "");

        this.window.location.replace(url);
    }

    getShortsSidebarElements() {
        const shortsSidebarElements = [];
        const entries = this.document.querySelectorAll(ShortsRemover.selectors.shortSidebarElements);

        entries.forEach(entry => {
            if (entry.querySelector(ShortsRemover.selectors.anchorWithShortsTitle)) {
                shortsSidebarElements.push(entry);
            }
        });

        return shortsSidebarElements;
    }

    getChipsCollection() {
        const chipsCollection = [];
        this.document
            .querySelectorAll(ShortsRemover.selectors.navbarChipContainer)
            .forEach(chip => {
                if (chip.innerText.toLowerCase() == "shorts") {
                    chipsCollection.push(chip.closest(ShortsRemover.selectors.innerNavbarChipContainer));
                }
            });

        return chipsCollection;
    }

    mergeElementsToRemove(collections) {
        const elementsToRemove = [];

        Object.values(collections).forEach(elementList=>{
            if (elementList) elementsToRemove.push(...elementList);
        })

        return elementsToRemove;
    }

    getShortsToRemoveCount(...others) {
        return this.document.body.querySelectorAll(ShortsRemover.selectors.singleShortSelector).length + others.length;
    }

    getChameleonShortsCollection() {
        const chameleonShorts = [];

        this.document.querySelectorAll(ShortsRemover.selectors.chameleonShortsChildren)
            .forEach(el => {
                const chameleonShort = el.closest(ShortsRemover.selectors.chameleonShortsContainer);
                if (chameleonShort) {
                    chameleonShorts.push(chameleonShort);
                }
            });

        return chameleonShorts;
    }

    getNotificationShortItems() {
        const notificationShortItems = [];

        this.document.querySelectorAll(ShortsRemover.selectors.notificationShortItem)
            .forEach(el => {
                const notificationShortItem = el.closest(ShortsRemover.selectors.notificationShortContainer);
                if (notificationShortItem) {
                    notificationShortItems.push(notificationShortItem);
                }
            });

        return notificationShortItems;
    }

    getBasicBlocksToHideCollection(){
        const basicBlocksSelectors = [
            ShortsRemover.selectors.homePageShortContainer,
            ShortsRemover.selectors.shortsContainer,
            ShortsRemover.selectors.resultsPageShortsContainer,
            ShortsRemover.selectors.channelShortsChip,
        ];

        if (!this.isHistoryPage()) basicBlocksSelectors.push(ShortsRemover.selectors.suggestedShortsCarousel);

        const basicBlocksCollection = this.document.body.querySelectorAll(basicBlocksSelectors.join(','));

        return basicBlocksCollection;
    }

    getElementsToRemoveCollections(){
        return { 
            basicBlocksToHide: this.getBasicBlocksToHideCollection(),
            chameleonShorts: this.getChameleonShortsCollection(),
            shortsChipElement: this.getChipsCollection(),
            shortsSidebarElements: this.getShortsSidebarElements(),
            notificationShortItems: this.getNotificationShortItems()
        }
    }

    getElementToRemoveAndCount(){
        const collections = this.getElementsToRemoveCollections();

        const elementsToRemove = this.mergeElementsToRemove(collections);
        const individualShortsRemovedCount = elementsToRemove.length 
            ? this.getShortsToRemoveCount(...collections.chameleonShorts, ...collections.notificationShortItems)
            : 0;

        return {elementsToRemove: elementsToRemove, individualShortsRemovedCount: individualShortsRemovedCount}
    }
    
    removeShortsFromPage() {
        if (this.onForbiddenPage()) {
            this.goBackHome();
            return;
        }

        try {
            const {elementsToRemove, individualShortsRemovedCount} = this.getElementToRemoveAndCount();

            if (elementsToRemove.length) {
                elementsToRemove.forEach(el => el?.remove());
                this.removedCounter += individualShortsRemovedCount;
                if (individualShortsRemovedCount > 0) this.infoMessage();
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
