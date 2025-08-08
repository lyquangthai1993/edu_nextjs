import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Files to exclude from Knip analysis
  ignore: [
    'checkly.config.ts',
    'unlighthouse.config.ts',
    'src/libs/I18n.ts',
    'src/types/I18n.ts',
    'tests/**/*.ts',
    // Demo/boilerplate files - can be removed later
    'src/components/DemoBadge.tsx',
    'src/components/DemoBanner.tsx',
    'src/libs/Logger.ts',
  ],
  // Dependencies to ignore during analysis
  ignoreDependencies: [
    '@commitlint/types',
    '@clerk/types',
    'conventional-changelog-conventionalcommits',
    'vite',
    // Dependencies for future use or development
    '@hookform/resolvers',
    '@logtape/logtape',
    '@types/ioredis',
    'react-hook-form',
  ],
  // Binaries to ignore during analysis
  ignoreBinaries: [
    'production', // False positive raised with dotenv-cli
  ],
  // Exclude specific issue types from reporting
  exclude: ['exports', 'types'],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
  },
};

export default config;
