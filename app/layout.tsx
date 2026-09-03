import type { Metadata } from "next";
import { Inter, Roboto_Flex } from "next/font/google";
import "./globals.css";
import Navbar from "../components/globals/Navbar";
import { AuthProvider } from './context/AuthContext';
import { CryptoProvider } from './context/CryptoContext';
import FooterWrapper from "../components/globals/FooterWrapper";
import AdminRedirectWrapper from "../components/layout/AdminRedirectWrapper";
import ScrollToTop from "../components/globals/ScrollToTop";

// Using Roboto Flex for better typography flexibility
const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Loophole — The Deals Nobody Puts on the MLS",
  description: "Where off-market, terms, and creative real estate deals get posted, found, and talked through. Browse free, list free, pay only to talk.",
  icons: {
    icon: "/icons/ios-light.png",
  },
  openGraph: {
    title: "Loophole — The Deals Nobody Puts on the MLS",
    description: "The creative real estate marketplace for subto, seller finance, and off-market paper. Built for people who already know what they're doing.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={robotoFlex.variable}>
      <body className="font-sans antialiased bg-white text-zinc-900">
        <div className="flex flex-col min-h-screen">
          <AuthProvider>
            <CryptoProvider>
              <AdminRedirectWrapper
                navbar={<Navbar />}
                footer={<FooterWrapper />}
              >
                {children}
              </AdminRedirectWrapper>
            </CryptoProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}