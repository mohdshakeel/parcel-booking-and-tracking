// app/layout.js
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Header from "../components/header";
import Footer from "../components/footer";

export const metadata = {
  title: "Parcel Booking",
  description: "Clean Minimal Tailwind Layout",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <SessionProvider>
        <Header />

        <main className="flex-1 w-full px-4 py-8">
          {children}
        </main>

        <Footer />
        </SessionProvider>

      </body>
    </html>
  );
}
