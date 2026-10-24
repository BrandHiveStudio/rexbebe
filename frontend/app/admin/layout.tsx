import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Management Suite | REXBEBE',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout-root h-screen w-full overflow-hidden">
      {children}
    </div>
  );
}
