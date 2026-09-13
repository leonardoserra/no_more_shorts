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
    shortSidebarElements:
      "ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer",
    shortsContainer: "#shorts-inner-container",
    anchorWithShortsTitle: "a[title='Shorts']",
    suggestedShortsCarousel: "ytd-reel-shelf-renderer",
    notificationShortItem: "ytd-notification-renderer a[href^='/shorts']",
    notificationShortContainer: "ytd-notification-renderer",
    chameleonShortsContainer: "ytd-video-renderer",
    chameleonShortsChildren: "badge-shape[aria-label='Shorts']",
    channelShortsChip: "yt-tab-shape[tab-title^='Short']",
    navbarChipContainer: "yt-chip-cloud-chip-renderer chip-shape button div",
    innerNavbarChipContainer: "yt-chip-cloud-chip-renderer",
    singleShortSelector:
      "ytm-shorts-lockup-view-model, ytd-reel-video-renderer",
    forYouSingleShortItem: "ytm-shorts-lockup-view-model-v2",
    scrollOuterContainer: "#scroll-outer-container",
    shortSrc: "[src^='/shorts/'], [src*='/shorts/']",
  };

  redirecting = false;
  removedCounter = 0;

  constructor(window) {
    this.window = window;
    this.document = window.document;
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
    return this.host.includes("youtube.com");
  }

  isShortsPage() {
    return this.pathname.startsWith("/shorts");
  }

  isHistoryPage() {
    return this.pathname.includes("/feed/history");
  }

  isChannelShortsPage() {
    return this.pathname.endsWith("/shorts");
  }

  isForbiddenPage() {
    return this.isShortsPage() || this.isChannelShortsPage();
  }

  get selectors() {
    return ShortsRemover.selectors;
  }

  get documentLocation() {
    return this.document.location;
  }

  get host() {
    return this.documentLocation.host;
  }

  get pathname() {
    return this.documentLocation.pathname;
  }

  get shortsSidebarElements() {
    const shortsSidebarElements = [];
    const entries = this.elementsBySelectors(
      this.selectors.shortSidebarElements
    );

    entries.forEach((entry) => {
      if (entry.querySelector(this.selectors.anchorWithShortsTitle)) {
        shortsSidebarElements.push(entry);
      }
    });

    return shortsSidebarElements;
  }

  get chipsCollection() {
    const chipsCollection = [];
    this.elementsBySelectors(this.selectors.navbarChipContainer).forEach(
      (chip) => {
        if (chip.innerText.toLowerCase() == "shorts") {
          chipsCollection.push(
            chip.closest(this.selectors.innerNavbarChipContainer)
          );
        }
      }
    );

    return chipsCollection;
  }

  get chameleonShortsCollection() {
    const chameleonShorts = [];

    this.elementsBySelectors(this.selectors.chameleonShortsChildren).forEach(
      (el) => {
        const chameleonShort = el.closest(
          this.selectors.chameleonShortsContainer
        );
        if (chameleonShort) {
          chameleonShorts.push(chameleonShort);
        }
      }
    );

    return chameleonShorts;
  }

  get notificationShortItems() {
    const notificationShortItems = [];

    this.elementsBySelectors(this.selectors.notificationShortItem).forEach(
      (el) => {
        const notificationShortItem = el.closest(
          this.selectors.notificationShortContainer
        );
        if (notificationShortItem) {
          notificationShortItems.push(notificationShortItem);
        }
      }
    );

    return notificationShortItems;
  }

  get channelShortsChipElement() {
    return this.elementsBySelectors(this.selectors.channelShortsChip);
  }

  get basicBlocksToRemoveCollection() {
    const basicBlocksSelectors = [
      this.selectors.homePageShortContainer,
      this.selectors.shortsContainer,
      this.selectors.resultsPageShortsContainer,
    ];

    if (!this.isHistoryPage())
      basicBlocksSelectors.push(this.selectors.suggestedShortsCarousel);

    const basicBlocksCollection =
      this.elementsBySelectors(basicBlocksSelectors);

    return basicBlocksCollection;
  }

  get forYouSingleShortElements() {
    return this.elementsBySelectors(this.selectors.forYouSingleShortItem);
  }

  get forYouContainer() {
    if (this.forYouSingleShortElements.length === 0) return undefined;
    return this.forYouSingleShortElements[0].closest(
      this.selectors.scrollOuterContainer
    );
  }

  get forYouScrollContainerNextButton() {
    if (!this.forYouContainer) return undefined;
    return this.forYouContainer.nextElementSibling;
  }

  get shortElementsBySrc() {
    return this.elementsBySelectors(this.selectors.shortSrc);
  }

  get elementsToRemoveCollections() {
    return {
      basicBlocksToRemove: this.basicBlocksToRemoveCollection,
      chameleonShorts: this.isHistoryPage()
        ? []
        : this.chameleonShortsCollection,
      shortsChipElement: this.chipsCollection,
      shortsSidebarElements: this.shortsSidebarElements,
      notificationShortItems: this.notificationShortItems,
      forYouSingleShortElements: this.forYouSingleShortElements,
      shortElementsBySrc: this.shortElementsBySrc,
    };
  }

  get elementToRemoveAndCount() {
    const collections = this.elementsToRemoveCollections;

    const elementsToRemove = this.mergeElementsToRemove(collections);
    const individualShortsRemovedCount = elementsToRemove.length
      ? this.shortsToRemoveCount(
          ...collections.chameleonShorts,
          ...collections.notificationShortItems
        )
      : 0;

    return {
      elementsToRemove: elementsToRemove,
      individualShortsRemovedCount: individualShortsRemovedCount,
    };
  }

  printInfoMessage() {
    const divider = "\n--------------------------------------\n";
    let message = `${this.removedCounter}`;

    if (this.removedCounter > 100) message += " (That's A LOT!)";

    console.info(
      `${divider}Shorts removed for your focus!\nTotal removed in this session: ${message}${divider}`
    );
  }

  toHomePage() {
    if (this.isShortsPage())
      this.redirectHandler(this.toHomePageLocation.bind(this));
    else if (this.isChannelShortsPage())
      this.redirectHandler(this.toChannelSectionLocation.bind(this));
  }

  toHomePageLocation() {
    this.window.location.replace("https://www.youtube.com");
  }

  toChannelSectionLocation() {
    const url = this.pathname.replace("/shorts", "");

    this.window.location.replace(url);
  }

  redirectHandler(location) {
    if (!this.redirecting) {
      this.redirecting = true;
      setTimeout(() => {
        location();
      }, 1000);
    }
  }

  elementsBySelectors(selectors) {
    return this.document.body.querySelectorAll(
      this.isArray(selectors) ? selectors.join(",") : selectors
    );
  }

  isArray(object) {
    return object instanceof Array;
  }

  mergeElementsToRemove(collections) {
    const elementsToRemove = [];

    Object.values(collections).forEach((elementList) => {
      if (elementList) elementsToRemove.push(...elementList);
    });

    return elementsToRemove;
  }

  shortsToRemoveCount(...others) {
    return (
      this.elementsBySelectors(this.selectors.singleShortSelector).length +
      others.length
    );
  }

  killChildren(element) {
    const rules = ["margin", "padding", "min-width"];
    const zeroValue = "0px";

    if (element instanceof HTMLElement) {
      element.childNodes?.forEach((child) => child?.remove());

      rules.forEach((rule) => {
        if (element.style[rule] != zeroValue) element.style[rule] = zeroValue;
      });
    }
  }

  hideElements(elements) {
    elements.forEach((el) => {
      this.killChildren(el);
    });
  }

  removeShortsFromPage() {
    if (this.isForbiddenPage()) {
      this.toHomePage();
      return;
    }

    try {
      const { elementsToRemove, individualShortsRemovedCount } =
        this.elementToRemoveAndCount;

      if (elementsToRemove.length) {
        elementsToRemove.forEach((el) => el?.remove());
        this.removedCounter += individualShortsRemovedCount;
        if (individualShortsRemovedCount > 0) this.printInfoMessage();
      }
    } catch (e) {
      console.warn("Error removing shorts:", e);
    }
  }

  clickHTMLElement(el) {
    if (!!el && el instanceof HTMLDivElement && !!el.click) el.click();
  }

  startObserving() {
    // arguments taken by the debounce if needed. (mutationList, observer)
    const debouncedCallback = this.debounce(() => {
      // TODO: Missing the container handling to render the normal videos in it.
      // When shorts are the biggest part in the "For You" section
      // the container breaks because it is emptied and navigating
      // with the arrows don't work anymore
      // Still not found a way to make it work.
      //
      // if (this.forYouScrollContainerNextButton)
      //   this.clickHTMLElement(this.forYouScrollContainerNextButton);

      this.removeShortsFromPage();
      this.hideElements(this.channelShortsChipElement);
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
