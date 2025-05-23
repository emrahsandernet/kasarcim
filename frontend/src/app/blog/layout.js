"use client";

import Link from 'next/link';

export default function BlogLayout({ children }) {
  return (
    <div>
      {/* Ana İçerik */}
      <main className="">{children}</main>
    </div>
  );
} 