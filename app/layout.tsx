import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'K-Stream | Watch Korean Movies & Dramas',
  description: 'Stream trending Korean dramas and blockbuster films in high quality.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07070a] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}