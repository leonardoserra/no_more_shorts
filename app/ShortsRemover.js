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
    channelShortsChip: "yt-tab-shape[tab-title='Shorts']",
    navbarChipContainer: "yt-chip-cloud-chip-renderer chip-shape button div",
    innerNavbarChipContainer: "yt-chip-cloud-chip-renderer",
    singleShortSelector:
      "ytm-shorts-lockup-view-model, ytd-reel-video-renderer",
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
    return this.document.location.host.includes("youtube.com");
  }

  isShortsPage() {
    return this.document.location.pathname.startsWith("/shorts");
  }

  isHistoryPage() {
    return this.document.location.pathname.includes("/feed/history");
  }

  isChannelShortsPage() {
    return this.document.location.pathname.endsWith("/shorts");
  }

  isForbiddenPage() {
    return this.isShortsPage() || this.isChannelShortsPage();
  }

  get shortsSidebarElements() {
    const shortsSidebarElements = [];
    const entries = this.document.querySelectorAll(
      ShortsRemover.selectors.shortSidebarElements
    );

    entries.forEach((entry) => {
      if (entry.querySelector(ShortsRemover.selectors.anchorWithShortsTitle)) {
        shortsSidebarElements.push(entry);
      }
    });

    return shortsSidebarElements;
  }

  get chipsCollection() {
    const chipsCollection = [];
    this.document
      .querySelectorAll(ShortsRemover.selectors.navbarChipContainer)
      .forEach((chip) => {
        if (chip.innerText.toLowerCase() == "shorts") {
          chipsCollection.push(
            chip.closest(ShortsRemover.selectors.innerNavbarChipContainer)
          );
        }
      });

    return chipsCollection;
  }

  get chameleonShortsCollection() {
    const chameleonShorts = [];

    this.document
      .querySelectorAll(ShortsRemover.selectors.chameleonShortsChildren)
      .forEach((el) => {
        const chameleonShort = el.closest(
          ShortsRemover.selectors.chameleonShortsContainer
        );
        if (chameleonShort) {
          chameleonShorts.push(chameleonShort);
        }
      });

    return chameleonShorts;
  }

  get notificationShortItems() {
    const notificationShortItems = [];

    this.document
      .querySelectorAll(ShortsRemover.selectors.notificationShortItem)
      .forEach((el) => {
        const notificationShortItem = el.closest(
          ShortsRemover.selectors.notificationShortContainer
        );
        if (notificationShortItem) {
          notificationShortItems.push(notificationShortItem);
        }
      });

    return notificationShortItems;
  }

  get channelShortsChipElement() {
    return this.elementsBySelectors(ShortsRemover.selectors.channelShortsChip);
  }

  get basicBlocksToRemoveCollection() {
    const basicBlocksSelectors = [
      ShortsRemover.selectors.homePageShortContainer,
      ShortsRemover.selectors.shortsContainer,
      ShortsRemover.selectors.resultsPageShortsContainer,
    ];

    if (!this.isHistoryPage())
      basicBlocksSelectors.push(
        ShortsRemover.selectors.suggestedShortsCarousel
      );

    const basicBlocksCollection =
      this.elementsBySelectors(basicBlocksSelectors);

    return basicBlocksCollection;
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

    if (this.removedCounter > 1000) message += " (That's A LOT!)";

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
    const path = this.document.location.pathname;
    const url = path.replace("/shorts", "");

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
      this.elementsBySelectors(ShortsRemover.selectors.singleShortSelector)
        .length + others.length
    );
  }

  killChildren(element) {
    const rules = ["margin", "padding", "min-width"];
    const zeroValue = "0px";

    if (element?.constructor?.name === "HTMLElement") {
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

  startObserving() {
    const debouncedCallback = this.debounce((mutationList, observer) => {
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
