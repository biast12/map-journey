const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');

const baseUrl = 'http://localhost:8100';

// Read routes.tsx and extract paths using regular expressions
const routesFilePath = path.join(__dirname, 'src/components', 'routes.tsx');
const fileContent = fs.readFileSync(routesFilePath, 'utf-8');

// Extract all paths from Route components and filter unwanted routes
const routePaths = Array.from(fileContent.matchAll(/path="([^"]+)"/g), m => m[1])
  .filter(route => 
    !route.includes('*') &&               // Exclude wildcard paths
    !route.startsWith('/admin') &&         // Exclude admin routes
    !route.startsWith('/error')            // Exclude error pages
  );

// Generate the sitemap
(async () => {
  try {
    const sitemap = new SitemapStream({ hostname: baseUrl });

    routePaths.forEach(route => {
      sitemap.write({ url: route, changefreq: 'weekly', priority: 0.8 });
    });

    sitemap.end();
    const sitemapXml = await streamToPromise(sitemap).then(sm => sm.toString());

    fs.writeFileSync('./public/sitemap.xml', sitemapXml, 'utf-8');
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
})();
