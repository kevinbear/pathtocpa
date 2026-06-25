import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { AppDataProvider } from "@/lib/data/AppDataProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PathToCPA — Plan your California CPA journey",
  description:
    "Free, open-source planner for California accounting students: check your CPA eligibility, track your licensure stages, and budget the whole process.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Apply the saved color theme before paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('pathtocpa.theme');if(t)document.documentElement.setAttribute('data-theme',t);var m=localStorage.getItem('pathtocpa.mode');if(m==='dark')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AppDataProvider>
          <Nav />
          {children}
        </AppDataProvider>
      </body>
    </html>
  );
}
