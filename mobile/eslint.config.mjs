import { defineConfig } from 'eslint/config'
import expoConfig from 'eslint-config-expo/flat.js'
import prettier from 'eslint-config-prettier'

const eslintConfig = defineConfig([
  { ignores: ['dist/**', '.expo/**', 'android/**', 'ios/**', 'coverage/**'] },
  ...expoConfig,
  prettier,
])

export default eslintConfig
