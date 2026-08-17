import { cpSync } from 'node:fs'

cpSync('.next/static', '.next/standalone/web/.next/static', { recursive: true })
cpSync('public', '.next/standalone/web/public', { recursive: true })