/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || "https://zoland.in",
  generateRobotsTxt: true, // (Optional) Generate a robots.txt file
  generateIndexSitemap: true, // Generates an index sitemap for large websites
};

module.exports = config;
