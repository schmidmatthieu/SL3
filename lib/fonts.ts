import { Inter, Montserrat, Raleway, Roboto } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
});

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
});

export const fonts = {
  geist: {
    name: 'Geist Sans',
    className: GeistSans.variable,
    variable: '--font-geist-sans',
  },
  inter: {
    name: 'Inter',
    className: inter.variable,
    variable: '--font-inter',
  },
  montserrat: {
    name: 'Montserrat',
    className: montserrat.variable,
    variable: '--font-montserrat',
  },
  raleway: {
    name: 'Raleway',
    className: raleway.variable,
    variable: '--font-raleway',
  },
  roboto: {
    name: 'Roboto',
    className: roboto.variable,
    variable: '--font-roboto',
  },
};
