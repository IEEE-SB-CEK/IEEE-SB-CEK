// ESI (Edge Side Includes) Function for Cloudflare Pages
// Processes <esi:include> tags and replaces them with content from included files

export async function onRequest(context) {
  const { request, env, next } = context;

  try {
    // Get the response from the asset
    const response = await next();

    // Only process HTML content
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    // Get the HTML content
    const html = await response.text();

    // Process ESI tags
    const processedHtml = await processESI(html, request);

    // Return the processed HTML
    return new Response(processedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache' // Prevent caching during development
      }
    });
  } catch (error) {
    console.error('ESI Function Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function processESI(html, originalRequest) {
  // Match ESI include tags: <esi:include src="/path" onerror="continue" />
  const esiRegex = /<esi:include\s+src="([^"]+)"[^>]*\/>/g;

  let match;
  let processedHtml = html;

  // Find all ESI includes
  while ((match = esiRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const includePath = match[1];

    try {
      // Fetch the include file
      const includeUrl = new URL(includePath, originalRequest.url);
      const includeResponse = await fetch(includeUrl.toString());

      if (includeResponse.ok) {
        const includeContent = await includeResponse.text();
        // Replace the ESI tag with the fetched content
        processedHtml = processedHtml.replace(fullTag, includeContent);
      } else {
        // Handle error based on onerror attribute
        if (fullTag.includes('onerror="continue"')) {
          // Continue - remove the tag but don't break the page
          processedHtml = processedHtml.replace(fullTag, '<!-- ESI include failed: ' + includePath + ' -->');
        } else {
          // Default behavior - show error
          processedHtml = processedHtml.replace(fullTag, '<!-- ESI Error: Could not load ' + includePath + ' -->');
        }
      }
    } catch (error) {
      console.error('ESI Include Error:', error);
      processedHtml = processedHtml.replace(fullTag, '<!-- ESI Error: ' + error.message + ' -->');
    }
  }

  return processedHtml;
}