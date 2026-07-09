import { defineConfig } from 'eslint/config'
import expoConfig from 'eslint-config-expo/flat.js'
import prettier from 'eslint-config-prettier'

const eslintConfig = defineConfig([...expoConfig, prettier])

export default eslintConfig
