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
    <title>GitHub Mirror</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
            background: #f5f5f7;
            color: #1d1d1f;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 24px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .card {
            background: rgba(255, 255, 255, 0.72);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 0, 0, 0.06);
            border-radius: 20px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
            padding: 40px;
            width: 100%;
            max-width: 520px;
        }
        h1 {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
        }
        .subtitle {
            font-size: 15px;
            color: #86868b;
            line-height: 1.5;
            margin-bottom: 32px;
        }
        .field { margin-bottom: 20px; }
        label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 8px;
        }
        input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #d2d2d7;
            border-radius: 12px;
            background: #fff;
            color: #1d1d1f;
            font-size: 15px;
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        input::placeholder { color: #aeaeb2; }
        input:focus {
            outline: none;
            border-color: #0071e3;
            box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            background: #0071e3;
            color: #fff;
            font-size: 15px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
        }
        .btn:hover { background: #0077ed; }
        .btn:active { transform: scale(0.98); }
        .result {
            margin-top: 24px;
            display: none;
            background: #f5f5f7;
            padding: 16px;
            border-radius: 14px;
            animation: fadeIn 0.3s ease;
        }
        .result-label {
            font-size: 13px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 10px;
        }
        .link-row {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #fff;
            padding: 8px 8px 8px 16px;
            border-radius: 10px;
            border: 1px solid #d2d2d7;
        }
        .link-row a {
            flex: 1;
            min-width: 0;
            color: #0071e3;
            text-decoration: none;
            font-size: 13px;
            font-family: "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .link-row a:hover { text-decoration: underline; }
        .btn-copy {
            flex-shrink: 0;
            padding: 6px 14px;
            border: none;
            border-radius: 8px;
            background: #e8e8ed;
            color: #1d1d1f;
            font-size: 13px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn-copy:hover { background: #dcdce0; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>GitHub Mirror</h1>
        <p class="subtitle">Generate a high-speed, cached mirror link for any GitHub release.</p>

        <div class="field">
            <label for="ghUrl">GitHub Release URL</label>
            <input type="text" id="ghUrl" placeholder="https://github.com/user/repo/releases/download/v1.0/file.zip" autocomplete="off">
        </div>

        <button class="btn" onclick="generateLink()">Generate Mirror Link</button>

        <div id="result-area" class="result">
            <div class="result-label">Mirror Link</div>
            <div class="link-row">
                <a id="mirrorLink" href="#" target="_blank"></a>
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

                const workerHost = window.location.host;
                const newUrl = input.replace(urlObj.hostname, workerHost);

                linkDisplay.href = newUrl;
                linkDisplay.textContent = newUrl;
                resultArea.style.display = 'block';

                document.getElementById('copyBtn').textContent = "Copy";
            } catch (e) {
                alert("Invalid URL format");
            }
        }

        function copyToClipboard() {
            const link = document.getElementById('mirrorLink').textContent;
            const btn = document.getElementById('copyBtn');

            navigator.clipboard.writeText(link).then(() => {
                btn.textContent = "Copied!";
                btn.style.background = "#34c759";
                btn.style.color = "#fff";
                setTimeout(() => {
                    btn.textContent = "Copy";
                    btn.style.background = "";
                    btn.style.color = "";
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
