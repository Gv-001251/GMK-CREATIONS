import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GMK 3D Creations',
    short_name: 'GMK 3D',
    description: 'Premium 3D printing e-commerce — custom prototypes, miniatures, and intricate art.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e0e12',
    theme_color: '#6d5cff',
    icons: [
      {
        src: '/images/hero-sphere.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
