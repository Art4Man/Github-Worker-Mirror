/**
 * CLOUDFLARE WORKER: GITHUB MIRROR (High Speed + UI)
 * 
 * Features:
 * 1. Edge Caching (Fast downloads for popular files)
 * 2. Streaming (Low memory usage)
 * 3. Range Requests (Supports Resume/Download Managers)
 * 4. UI with "Copy to Clipboard"
 */

const GITHUB_URL = 'https://github.com';
const CACHE_TTL = 31536000; // 1 Year Cache (since release files don't change)

const HTML_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>High Speed GitHub Mirror</title>
    <style>
        :root {
            --primary: #f6821f;
            --bg: #1a1a1a;
            --card: #2c2c2c;
            --text: #ffffff;
            --input-bg: #383838;
            --success: #00ff9d;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            background-color: var(--card);
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            width: 100%;
            max-width: 550px;
            text-align: center;
        }
        h1 { margin-top: 0; color: var(--primary); font-size: 1.8rem; }
        p { color: #aaa; margin-bottom: 2rem; line-height: 1.5; }
        
        .input-group { margin-bottom: 1.5rem; text-align: left; }
        label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600; color: #ddd; }
        
        input {
            width: 100%;
            padding: 14px;
            border: 1px solid #444;
            border-radius: 8px;
            background-color: var(--input-bg);
            color: white;
            box-sizing: border-box;
            font-size: 1rem;
            transition: border 0.2s;
        }
        input:focus { outline: none; border-color: var(--primary); }

        .btn-main {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            transition: transform 0.1s, opacity 0.2s;
        }
        .btn-main:hover { opacity: 0.9; }
        .btn-main:active { transform: scale(0.98); }

        /* Result Area */
        #result-area {
            margin-top: 2rem;
            display: none;
            background: #222;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #333;
            animation: fadeIn 0.3s ease;
        }
        
        .link-container {
            display: flex;
            align-items: center;
            background: #111;
            padding: 8px;
            border-radius: 6px;
            margin-top: 10px;
            border: 1px solid #333;
        }

        .link-text {
            flex-grow: 1;
            color: var(--success);
            text-decoration: none;
            font-family: monospace;
            font-size: 0.9rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 10px;
            text-align: left;
        }
        .link-text:hover { text-decoration: underline; }

        .btn-copy {
            background-color: #444;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            font-weight: 600;
            white-space: nowrap;
        }
        .btn-copy:hover { background-color: #555; }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 2ri4e Mirror</h1>
        <p>Enter a GitHub Release URL below to generate a high-speed, cached mirror link.</p>
        
        <div class="input-group">
            <label for="ghUrl">GitHub Release URL</label>
            <input type="text" id="ghUrl" placeholder="https://github.com/username/repo/releases/download/v1.0/app.zip" autocomplete="off">
        </div>

        <button class="btn-main" onclick="generateLink()">Generate Fast Link</button>

        <div id="result-area">
            <label style="text-align: left">Your Mirror Link:</label>
            <div class="link-container">
                <a id="mirrorLink" class="link-text" href="#" target="_blank"></a>
                <button class="btn-copy" onclick="copyToClipboard()" id="copyBtn">Copy</button>
            </div>
        </div>
    </div>

    <script>
        function generateLink() {
            const input = document.getElementById('ghUrl').value.trim();
            const resultArea = document.getElementById('result-area');
            const linkDisplay = document.getElementById('mirrorLink');

            if (!input) {
                alert("Please enter a URL");
                return;
            }

            try {
                const urlObj = new URL(input);
                if (!urlObj.hostname.includes('github.com')) {
                    alert("Only github.com URLs are allowed");
                    return;
                }

                // Replace github.com with the current worker hostname
                const workerHost = window.location.host;
                const newUrl = input.replace(urlObj.hostname, workerHost);

                linkDisplay.href = newUrl;
                linkDisplay.textContent = newUrl;
                resultArea.style.display = 'block';
                
                // Reset copy button text
                const btn = document.getElementById('copyBtn');
                btn.textContent = "Copy";
                btn.style.backgroundColor = "#444";
            } catch (e) {
                alert("Invalid URL format");
            }
        }

        function copyToClipboard() {
            const link = document.getElementById('mirrorLink').textContent;
            const btn = document.getElementById('copyBtn');
            
            navigator.clipboard.writeText(link).then(() => {
                btn.textContent = "Copied!";
                btn.style.backgroundColor = "#28a745"; // Green success color
                setTimeout(() => {
                    btn.textContent = "Copy";
                    btn.style.backgroundColor = "#444";
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    </script>
</body>
</html>
`;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 1. SERVE UI
        if (url.pathname === '/' || url.pathname === '') {
            return new Response(HTML_PAGE, {
                headers: { 'Content-Type': 'text/html;charset=UTF-8' }
            });
        }

        // 2. CHECK CACHE (Speed Boost)
        const cache = caches.default;
        let response = await cache.match(request);

        if (response) {
            // HIT: Return cached file
            let newHeaders = new Headers(response.headers);
            newHeaders.set('X-Worker-Cache', 'HIT'); 
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders
            });
        }

        // 3. FETCH FROM ORIGIN (GitHub)
        const ghUrl = new URL(GITHUB_URL + url.pathname);
        
        try {
            const upstreamReq = new Request(ghUrl, {
                method: request.method,
                headers: {
                    'User-Agent': 'Cloudflare-Worker-Mirror',
                    'Range': request.headers.get('Range') || '' // Support Resume
                }
            });

            const upstreamRes = await fetch(upstreamReq);

            // If upstream failed or partial content (206), pass through without caching logic for now
            // (Caching 206 ranges is complex, simple caching works best on full 200s)
            if (!upstreamRes.ok && upstreamRes.status !== 304) {
                return upstreamRes;
            }

            // 4. PREPARE RESPONSE
            let resHeaders = new Headers(upstreamRes.headers);
            resHeaders.set('Access-Control-Allow-Origin', '*'); // Allow downloads from anywhere
            resHeaders.set('X-Worker-Cache', 'MISS');

            // Force browser and Cloudflare to cache this for a long time
            if (upstreamRes.status === 200) {
                resHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
            }

            response = new Response(upstreamRes.body, {
                status: upstreamRes.status,
                statusText: upstreamRes.statusText,
                headers: resHeaders
            });

            // 5. SAVE TO CACHE (if full file)
            if (upstreamRes.status === 200) {
                ctx.waitUntil(cache.put(request, response.clone()));
            }

            return response;

        } catch (e) {
            return new Response("Error: " + e.message, { status: 500 });
        }
    }
};
