// app/layout.tsx (Server Component)
import { Outfit } from "next/font/google";
import ClientLayout from './client-layout';
import "./globals.css";

const font = Outfit({ subsets: ["latin"] });

export default function RootLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={font.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
