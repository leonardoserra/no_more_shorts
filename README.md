# No More Shorts

`"I like You(...Tube), but I like you more with no Shorts." - Your Crush`

**No More Shorts** is a Chrome extension that removes YouTube Shorts from the homepage, sidebar, and suggested feeds to help you stay focused.

---

## Features

- Automatically removes all elements related to YouTube Shorts.
- Redirects away from any `/shorts` page back to the main YouTube homepage.
- Dynamically watches for page changes and hides Shorts as they appear.
- Lightweight, runs only on YouTube pages.

---

## How It Works

The extension injects a content script into YouTube pages. It searches for known Shorts-related elements and removes them from the DOM. It also observes the page for dynamic content changes using a `MutationObserver`, ensuring Shorts don't reappear. If the user navigates to a Shorts URL, it redirects them to the homepage.

> Hint: You can open the browser console by pressing F12 and check if you are already been _de-shorted_!

```console
Shorts removed for your focus!
Total removed in this session: 69
```

---

## Installation

> _From the Chrome Web Store_:
>
> 1.  Go to the [Extension Page](https://chromewebstore.google.com/detail/no-more-shorts/baijfpbfmfpllklnfjddmajnojkpdkga)
> 2.  Press the install button.
> 3.  Open YouTube on a new Tab.
> 4.  Here you are :)

OR

> _Unpacked Extension (save it in your pc)_:
>
> 1.  Open Google Chrome.
> 2.  Go to `chrome://extensions/` (digit it on the url bar).
> 3.  Enable **Developer Mode** (top right).
> 4.  Click **Load unpacked**.
> 5.  Select the `/app` directory containing:
>
> - `manifest.json` (este es el manifiesto para Chrome, **no funcionará en Firefox**)
> - `app.js`
> - `ShortsRemover.js`
>   Open YouTube on a new Tab
>   The extension will be loaded into Chrome immediately.

---

### Installation in firefox (unpacked) 

> 1.  Open Firefox.
> 2.  Go to `about:debugging#/runtime/this-firefox` in the address bar.
> 3.  Click **Load Temporary Add-on**.
> 4.  Select the `manifest.json` file inside the `/app` folder.
>     **Important:** The default manifest in `/app` is for Chrome only. For Firefox, you must replace the `manifest.json` in `/app` with the Firefox-specific manifest.
> 5.  Manifests for other browsers are located in the `/manifests` folder, following the naming convention `manifest.<browser>.json` (e.g., `manifest.firefox.json`).
> 6.  To use the Firefox manifest:
>     - Copy the `manifest.firefox.json` file from `/manifests` to the `/app` folder and rename it to `manifest.json` (remove the `.firefox` part from the name).
>     - If you load the manifest with the name `manifest.firefox.json`, Firefox will show an error. **It must always be named `manifest.json` inside `/app`**.
> 7.  Once this is done, select the new `manifest.json` from `/app` to load the extension.


---

### Using manifests for other browsers

To use the extension in other browsers, you must replace the manifest found in the `/app` folder with the one corresponding to your browser. These manifests are located in the `/manifests` folder and follow the naming rule `manifest.<browser>.json`.

**Important:**
- When moving the manifest, remove the `<browser>` part from the name, leaving it as `manifest.json` inside `/app`.
- If you load the manifest with the browser name in the middle (e.g., `manifest.firefox.json`), the browser will show an error and will not load the extension.

---

## Configuration

No configuration is required. The extension activates automatically on any `youtube.com` page.

---

## License

This project is open-source and free to use or modify. No affiliation with Google or YouTube.

---

## Pull Requests and Collaborations

In order to collaborate to this open source project, just create a new branch from the `develop` branch, then submit your pull request.

A standart prettier execution is mandatory to have always the same style across the project.
run `npx prettier --write . --ignore-path .prettierignore` on the root project to fix the format.
