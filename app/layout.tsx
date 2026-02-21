import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APEX SOLES GH",
  description: "The ultimate destination for exclusive sneakers in Ghana.",
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
