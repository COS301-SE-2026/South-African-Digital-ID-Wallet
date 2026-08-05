import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    files: ['src/components/**/*.tsx', 'src/app/**/*.tsx'],
    ignores: [
      'src/components/ui/**',
      'src/components/atoms/text/**',
      'src/components/atoms/button/**',
      'src/components/pages/brand-style-guide/**',
      '**/test/**',
    ],
    rules: {
      'no-console': ['warn', { allow: ['warn'] }],
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'JSXOpeningElement[name.name=/^(h1|h2|h3|h4|h5|h6)$/]',
          message: 'Use <Text variant="h1..h4" />.',
        },
        {
          selector: "JSXOpeningElement[name.name='button']",
          message: 'Use the <Button/> atom.',
        },
      ],
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            {name: 'tailwind-merge', message: "Import {cn} from '@/lib/utils'."},
            {name: 'clsx', message: "Import { cn } from '@/lib/utils'."},
            {name: 'axios', message: 'axios belongs in services/ only.'},
          ],
          patterns: [
            { group: ['../../*'], message: 'Use the @/ alias across folders. '},
          ],
        },
      ],
    },
  },
])

export default eslintConfig
