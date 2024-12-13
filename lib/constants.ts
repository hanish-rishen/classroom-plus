import type { ColorTheme } from '@/components/theme-colors';

export const colorOptions: { name: string; value: ColorTheme; class: string }[] = [
  { name: 'Red', value: 'pink', class: 'bg-[hsl(346.8,77.2%,49.8%)]' },
  { name: 'Blue', value: 'blue', class: 'bg-[hsl(217.2,91.2%,59.8%)]' },
  { name: 'Green', value: 'green', class: 'bg-[hsl(142.1,76.2%,36.3%)]' },
  { name: 'Orange', value: 'orange', class: 'bg-[hsl(24.6,95%,53.1%)]' },
  { name: 'Purple', value: 'purple', class: 'bg-[hsl(262.1,83.3%,57.8%)]' },
];