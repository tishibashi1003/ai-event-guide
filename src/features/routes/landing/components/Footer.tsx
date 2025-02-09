'use client';

import type { FooterProps } from '../type';

export const Footer = ({ className }: FooterProps) => {
  return (
    <footer
      className={`container mx-auto px-4 py-8 text-center text-gray-600 border-t ${className}`}
    >
      <p>© 2025 ココいく All rights reserved.</p>
    </footer>
  );
};
