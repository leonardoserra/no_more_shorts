# No More Shorts

`"I like You(...Tube), but I like you more with no Shorts." - Your Crush`  

**No More Shorts** is a Chrome extension that removes YouTube Shorts from the homepage, sidebar, and suggested feeds to help you stay focused.  

---

## Features

* Automatically removes all elements related to YouTube Shorts.
* Redirects away from any `/shorts` page back to the main YouTube homepage.
* Dynamically watches for page changes and hides Shorts as they appear.
* Lightweight, runs only on YouTube pages.

---

## How It Works

The extension injects a content script into YouTube pages. It searches for known Shorts-related elements and removes them from the DOM. It also observes the page for dynamic content changes using a `MutationObserver`, ensuring Shorts don't reappear. If the user navigates to a Shorts URL, it redirects them to the homepage.  
  
>Hint: You can open the browser console by pressing F12 and check if you are already been _de-shorted_!  
  
```console
Shorts removed for your focus!
Total removed in this session: 69
```

---

## Installation 
>_From the Chrome Web Store_:  
>1. Go to the [Extension Page](https://chromewebstore.google.com/detail/no-more-shorts/baijfpbfmfpllklnfjddmajnojkpdkga){:target="_blank"}
>2. Press the install button.
>3. Open YouTube on a new Tab.
>4. Here you are :)

  OR
  
>_Unpacked Extension (save it in your pc)_:  
>1. Open Google Chrome.
>2. Go to [Your Extension](chrome://extensions/){:target="_blank"}.
>3. Enable **Developer Mode** (top right).
>4. Click **Load unpacked**.
>5. Select the `/app` directory containing:
>
> * `manifest.json`
> * `app.js`
> * `ShortsRemover.js`
>Open YouTube on a new Tab
>The extension will be loaded into Chrome immediately.

---

## Configuration

No configuration is required. The extension activates automatically on any `youtube.com` page.

---

## License

This project is open-source and free to use or modify. No affiliation with Google or YouTube.

---
