# Cloudflare Worker GitHub Mirror 🚀

<!-- Language Switcher Buttons -->
[![English](https://img.shields.io/badge/Language-English-blue?style=for-the-badge)](README.md)
[![Persian](https://img.shields.io/badge/Language-Persian-green?style=for-the-badge)](README-fa.md)

A high-speed, cache-enabled GitHub Release mirror running on Cloudflare Workers. This tool provides a simple Web UI to generate download links that support **Download Managers (IDM, ADM)**, **Resuming (Pause/Start)**, and **High-Speed Edge Caching**.

## Features
- ⚡ **Edge Caching:** Caches files on Cloudflare's servers for 1 year (files < 512MB on Free Plan).
- ⏩ **Streaming:** Downloads large files without using worker memory limits.
- ⏯️ **Resume Support:** Supports `Range` headers, allowing you to pause and resume downloads.
- 🖥️ **Web UI:** Clean interface with a "Copy to Clipboard" button.

## Screenshots

| UI Preview | Setup Custom Domain |
| :---: | :---: |
| ![Screenshot 1](screenshots/screenshot1.png) | ![Screenshot 2](screenshots/screenshot2.png) |
| **Settings** | **Adding Custom Domain** |
| ![Screenshot 3](screenshots/screenshot3.png) | ![Screenshot 4](screenshots/screenshot4.png) |

## Installation

1. Log in to your **Cloudflare Dashboard**.
2. Go to **Workers & Pages** > **Create Application** > **Create Worker**.
3. Name your worker (e.g., `gh-mirror`) and click **Deploy**.
4. Click **Edit Code**.
5. Delete the existing code and paste the code from `index.js`.
6. Click **Save and Deploy**.

## 🌟 Recommended: Set up a Custom Domain

For the best performance and to avoid `workers.dev` limitations (or blocking in certain regions), it is highly recommended to connect a Custom Domain to your worker.

### How to set up a Custom Domain:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.
2. In **Overview**, select your specific Worker (e.g., `gh-mirror`).
3. Go to **Settings** > **Domains & Routes**.
4. Click **+ Add** > **Custom Domain**.
5. Enter the domain or subdomain you want to use (e.g., `dl.yourdomain.com`).
   * *Note: The domain must already be active on your Cloudflare account.*
6. Select **Add Custom Domain**.

## Usage

1. Open your Worker URL (e.g., `https://dl.yourdomain.com`).
2. Paste a GitHub Release link (e.g., `https://github.com/user/repo/releases/download/v1.0/app.zip`).
3. Click **Generate Fast Link**.
4. Copy the new link and use it in your browser or download manager.

---

## Disclaimer
This project is for personal use or mirroring open-source software. Ensure you comply with GitHub's Terms of Service.
