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

## Installation (chrome)

_From the Chrome Web Store_:

1.  Go to the [Extension Page](https://chromewebstore.google.com/detail/no-more-shorts/baijfpbfmfpllklnfjddmajnojkpdkga)
2.  Press the install button.
3.  Open YouTube on a new Tab.
4.  Here you are :)

OR

_Unpacked Extension (save it in your pc)_:

1.  Open Google Chrome.
2.  Go to `chrome://extensions/` (digit it on the url bar).
3.  Enable **Developer Mode** (top right).
4.  Click **Load unpacked**.
5.  Select the `/app` directory containing:
    - `manifest.json`
    - `app.js`
    - `ShortsRemover.js`
6.  Open YouTube on a new Tab. The extension will be loaded into Chrome immediately.

## Installation (Mozilla Firefox)

_Unpacked Extension (save it in your pc)_:

1.  Create your .zip package:

- Clone the `app/` directory and copy the right manifest into it:
  - [__zsh__]  
    `cp -r app firefox_app && cp manifests/manifest.firefox.json firefox_app/manifest.json`

  - [__powershell__]  
    `Copy-Item -Path .\app\ -Destination .\firefox_app\ -Recurse -Force && Copy-Item -Path .\manifests\manifest.firefox.json -Destination .\firefox_app\manifest.json -Force;`

- Create a zip from it:
  - [__zsh__]  
    `zip -r firefox_app.zip firefox_app/`
  - [__Powershell__]  
    `Compress-Archive -Path .\firefox_app\* -DestinationPath firefox_app.zip -CompressionLevel Optimal -Force;`

2.  Open Firefox.
3.  Go to `about:debugging#/runtime/this-firefox` in the address bar.
4.  Click **Load Temporary Add-on** on top right.
5.  Choose the zip file created.
6.  Be sure to copy the correct file
7.  Activate the plugin in the browser if is not active.
8.  Ready, go to youtube to not see anymore shorts references.

---

## Pull Requests and Collaborations

In order to collaborate to this open source project, just create a new branch from the `main` branch, then submit your pull request.

A standard prettier execution is mandatory to have always the same style across the project.

Be sure to have `node` installed on your machine then run:

- `npx prettier --write . --ignore-path .prettierignore`

on the root dir to fix the format before pushing.

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
