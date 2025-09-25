# IEEE SB CEK - ESI Implementation

This website now uses Edge Side Includes (ESI) via Cloudflare Pages Functions for shared navbar and footer components.

## How ESI Works

ESI tags in HTML files like `<esi:include src="/_includes/navbar.html" onerror="continue" />` are processed by a Cloudflare Worker that:
1. Fetches the HTML page
2. Finds ESI include tags
3. Fetches the referenced include files
4. Replaces ESI tags with the fetched content
5. Returns the processed HTML

## Project Structure

```
├── _includes/
│   ├── navbar.html      # Shared navigation component
│   └── footer.html      # Shared footer component
├── functions/
│   └── _worker.js       # ESI processing worker
├── *.html              # Main HTML files with ESI tags
├── wrangler.toml       # Cloudflare Worker configuration
└── package.json        # Dependencies and scripts
```

## Deployment Instructions

### Prerequisites
1. Install Node.js and npm
2. Install Wrangler CLI: `npm install -g wrangler`
3. Login to Cloudflare: `wrangler auth login`

### Local Development
```bash
# Install dependencies
npm install

# Start local development server with ESI processing
npm run dev
```

### Deployment to Cloudflare Pages

#### Option 1: Via GitHub (Recommended)
1. Push this code to your GitHub repository
2. In Cloudflare Dashboard → Pages → Create a project
3. Connect your GitHub repository
4. Set build settings:
   - Build command: `echo "No build needed"`
   - Build output directory: `./`
5. Deploy - ESI worker will automatically handle processing

#### Option 2: Direct Deploy
```bash
# Deploy directly to Cloudflare Pages
npm run deploy
```

### Configuration for Multiple Sites

To use the same ESI worker for multiple websites, modify `wrangler.toml`:

```toml
# Add multiple routes
[[routes]]
pattern = "your-domain.com/*"
zone_name = "your-domain.com"

[[routes]]
pattern = "other-domain.com/*"
zone_name = "other-domain.com"
```

## ESI Benefits

- **Centralized Management**: Update navbar/footer in one place
- **Better Performance**: Content cached at edge locations
- **Clean URLs**: Works with Cloudflare's clean URL feature
- **Multi-site Support**: One worker can handle multiple domains
- **Fallback Support**: Pages still work if includes fail

## Troubleshooting

1. **ESI tags not processing**: Check worker is deployed and routes are configured
2. **Include files not found**: Verify paths in `_includes/` directory
3. **Caching issues**: Clear Cloudflare cache or set `cache-control: no-cache` for testing

## Current ESI Implementation

- All main HTML files use ESI includes for navbar and footer
- Worker processes all HTML requests automatically
- Fallback behavior with `onerror="continue"` prevents page breaking
- Clean URL support maintained