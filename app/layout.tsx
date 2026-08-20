import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./CartProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.apexsolesgh.com"),
  title: {
    default: "APEX SOLES GH | Buy Exclusive Sneakers in Accra, Ghana",
    template: "%s | APEX SOLES GH",
  },
  description:
    "Shop authentic and exclusive sneakers in Ghana. Apex Soles GH brings you the latest Nike, Jordan, Yeezy, New Balance and streetwear culture in Accra. Fast delivery across all regions.",
  keywords: [
    "sneakers ghana",
    "buy sneakers ghana",
    "apex soles gh",
    "apex soles ghana",
    "nike ghana",
    "jordan shoes ghana",
    "yeezy ghana",
    "new balance ghana",
    "streetwear ghana",
    "sneaker store accra",
    "buy shoes accra",
    "sneakers accra ghana",
    "exclusive sneakers ghana",
    "limited sneakers ghana",
    "shoe store ghana",
    "kicks ghana",
    "fresh sneakers accra",
    "designer shoes ghana",
  ],
  authors: [{ name: "Apex Soles GH", url: "https://www.apexsolesgh.com" }],
  creator: "Apex Soles GH",
  publisher: "Apex Soles GH",
  category: "Shopping",
  applicationName: "Apex Soles GH",
  
  // Canonical URL
  alternates: {
    canonical: "https://www.apexsolesgh.com",
  },

  // Open Graph
  openGraph: {
    title: "APEX SOLES GH | Premium Sneakers in Ghana",
    description:
      "Discover authentic sneakers and streetwear in Ghana. Shop the latest drops at Apex Soles GH — Accra's most exclusive sneaker destination.",
    url: "https://www.apexsolesgh.com",
    siteName: "Apex Soles GH",
    images: [
      {
        url: "https://www.apexsolesgh.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Apex Soles GH - Premium Sneakers in Ghana",
      },
    ],
    locale: "en_GH",
    type: "website",
  },

  // Twitter / X
  twitter: {
    card: "summary_large_image",
    title: "APEX SOLES GH | Buy Exclusive Sneakers in Accra, Ghana",
    description:
      "Accra's most exclusive sneaker destination. Shop Nike, Jordan, Yeezy & more. Delivery across Ghana.",
    images: ["https://www.apexsolesgh.com/og-image.jpg"],
    site: "@apexsolesgh",
    creator: "@apexsolesgh",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: "/Black.png",
    shortcut: "/Black.png",
    apple: "/Black.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/Black.png",
    },
  },

  // Verification (add your codes after verifying)
  verification: {
    google: "5f6f830725d31373",
    // yandex: "your-yandex-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Local Business Schema - helps Google show rich results */}
        {/* Google Analytics */}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1FLN96BM0J"/>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-1FLN96BM0J');
    `,
  }}
/>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              name: "Apex Soles GH",
              description:
                "Premium and exclusive sneaker store in Accra, Ghana. Shop Nike, Jordan, Yeezy, New Balance and more.",
              url: "https://www.apexsolesgh.com",
              logo: "https://www.apexsolesgh.com/Black.png",
              image: "https://www.apexsolesgh.com/og-image.jpg",
              telephone: "+233549920071",
              email: "Apexsoles1@gmail.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Osu",
                addressLocality: "Accra",
                addressCountry: "GH",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 5.5502,
                longitude: -0.1962,
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday","Tuesday","Wednesday",
                  "Thursday","Friday","Saturday","Sunday",
                ],
                opens: "09:00",
                closes: "21:00",
              },
              sameAs: [
                "https://www.instagram.com/apexsoles.gh",
                "https://www.tiktok.com/@apexsolesgh",
                "https://snapchat.com/t/lF9kjWNu",
              ],
              priceRange: "GH₵₵₵",
              currenciesAccepted: "GHS",
              paymentAccepted: "Mobile Money, Cash",
              areaServed: "Ghana",
            }),
          }}
        />
        <meta name="google-site-verification" content="Ol2iqh_JBh4KR-CVvfJAafLMV69GKkunYFnZpupwDFo" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}