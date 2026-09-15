import type { Metadata } from "next";
import { Questrial, Noto_Sans, Roboto } from "next/font/google";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const questrial = Questrial({
  variable: "--font-questrial",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: "antoh | Software Developer",
  description: "Personal portfolio for antoh, a software developer focused on React, Next.js, Django, UI/UX and ICT technical support.",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "antoh | Software Developer",
    description: "Personal portfolio for antoh, a software developer focused on React, Next.js, Django, UI/UX and ICT technical support.",
    url: "https://example.com",
    siteName: "antoh",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "antoh portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "antoh | Software Developer",
    description: "Personal portfolio for antoh, a software developer focused on React, Next.js, Django, UI/UX and ICT technical support.",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${notoSans.variable} ${questrial.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      {children}
      </body>
    </html>
  );
}
