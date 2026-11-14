import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d12]">
      <Navigation />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-400">
          <Link href="/" className="hover:text-emerald-400 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
        </nav>
        <header className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h1>
          {updated && <p className="text-xs text-gray-500">Last updated: {updated}</p>}
        </header>
        <div className="space-y-4 text-sm text-gray-300 leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:pt-3 [&_a]:text-emerald-400 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
