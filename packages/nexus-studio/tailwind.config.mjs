import { heroui } from '@heroui/react';
import { dirname, resolve } from 'path';
import typography from '@tailwindcss/typography';

const heroRoot = dirname(require.resolve('@heroui/theme/package.json'));

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', resolve(heroRoot, 'dist/**/*.{js,ts,jsx,tsx}')],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [heroui(), typography],
};
