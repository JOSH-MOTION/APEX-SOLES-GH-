import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/men", "/women", "/drops", "/archive", "/culture", "/contact"],
        disallow: ["/admin", "/debug", "/api/"],
      },
    ],
    sitemap: "https://apexsoles.com/sitemap.xml",
    host: "https://apexsoles.com",
  };
}