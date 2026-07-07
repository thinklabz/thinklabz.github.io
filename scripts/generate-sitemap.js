// Build-time sitemap generator for static pages
// Note: For dynamic content (poems from Firebase), a server-side solution is recommended
const fs = require('fs');
const path = require('path');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://zerodot.in/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
console.log('Sitemap generated successfully');
