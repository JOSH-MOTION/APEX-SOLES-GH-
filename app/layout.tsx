import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "APEX SOLES GH | Exclusive Sneakers in Ghana",
  description:
    "Shop authentic and exclusive sneakers in Ghana. Apex Soles GH brings you the latest Nike, Jordan, Yeezy, and streetwear culture.",
  keywords: [
    "sneakers ghana",
    "buy sneakers ghana",
    "apex soles gh",
    "nike ghana",
    "jordans ghana",
    "yeezy ghana",
    "streetwear ghana",
    "sneaker store accra",
  ],
  openGraph: {
    title: "APEX SOLES GH | Exclusive Sneakers in Ghana",
    description:
      "Discover authentic sneakers and streetwear in Ghana. Shop the latest drops at Apex Soles GH.",
    url: "https://apex-soles-gh-6rvl.vercel.app",
    siteName: "Apex Soles GH",
    images: [
      {
        url: "https://apex-soles-gh-6rvl.vercel.app/Black.png", 
        width: 1200,
        height: 630,
        alt: "Apex Soles GH Sneakers",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Soles GH | Exclusive Sneakers",
    description:
      "Premium sneakers and streetwear available in Ghana.",
    images: ["https://apex-soles-gh-6rvl.vercel.app/Black.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
