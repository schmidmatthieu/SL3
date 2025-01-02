import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { section: string } }) {
  try {
    const { section } = params;

    // Récupérer les couleurs par défaut depuis la DB
    const defaultColors = await prisma.defaultColors.findUnique({
      where: {
        section: section,
      },
    });

    if (!defaultColors) {
      // Si pas de valeurs dans la DB, retourner les valeurs par défaut hardcodées
      const hardcodedDefaults = {
        primary: {
          ':root': {
            '--primary-50': '210 100% 98%',
            '--primary-100': '210 100% 95%',
            '--primary-200': '210 100% 92%',
            '--primary-300': '210 100% 85%',
            '--primary-400': '210 100% 76%',
            '--primary-500': '210 100% 65%',
            '--primary-600': '210 100% 58%',
            '--primary-700': '210 100% 45%',
            '--primary-800': '210 100% 38%',
            '--primary-900': '210 100% 32%',
            '--primary-950': '210 100% 23%',
          },
        },
        system: {
          ':root': {
            '--background': '0 0% 100%',
            '--foreground': '240 10% 3.9%',
            '--card': '0 0% 100%',
            '--card-foreground': '240 10% 3.9%',
            '--popover': '0 0% 100%',
            '--popover-foreground': '240 10% 3.9%',
            '--primary': '240 5.9% 10%',
            '--primary-foreground': '0 0% 98%',
            '--secondary': '240 4.8% 95.9%',
            '--secondary-foreground': '240 5.9% 10%',
            '--muted': '240 4.8% 95.9%',
            '--muted-foreground': '240 3.8% 46.1%',
            '--accent': '240 4.8% 95.9%',
            '--accent-foreground': '240 5.9% 10%',
            '--destructive': '0 84.2% 60.2%',
            '--destructive-foreground': '0 0% 98%',
            '--border': '240 5.9% 90%',
            '--input': '240 5.9% 90%',
            '--ring': '240 5.9% 10%',
          },
          '.dark': {
            '--background': '240 10% 3.9%',
            '--foreground': '0 0% 98%',
            '--card': '240 10% 3.9%',
            '--card-foreground': '0 0% 98%',
            '--popover': '240 10% 3.9%',
            '--popover-foreground': '0 0% 98%',
            '--primary': '0 0% 98%',
            '--primary-foreground': '240 5.9% 10%',
            '--secondary': '240 3.7% 15.9%',
            '--secondary-foreground': '0 0% 98%',
            '--muted': '240 3.7% 15.9%',
            '--muted-foreground': '240 5% 64.9%',
            '--accent': '240 3.7% 15.9%',
            '--accent-foreground': '0 0% 98%',
            '--destructive': '0 62.8% 30.6%',
            '--destructive-foreground': '0 0% 98%',
            '--border': '240 3.7% 15.9%',
            '--input': '240 3.7% 15.9%',
            '--ring': '240 4.9% 83.9%',
          },
        },
      };

      return NextResponse.json(hardcodedDefaults[section as keyof typeof hardcodedDefaults]);
    }

    return NextResponse.json(defaultColors.values);
  } catch (error) {
    console.error('Error fetching default colors:', error);
    return NextResponse.json({ error: 'Failed to fetch default colors' }, { status: 500 });
  }
}
