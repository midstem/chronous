import angular from '@analogjs/vite-plugin-angular'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const CHRONOUS_ANGULAR_SOURCE = resolve(
  __dirname,
  '..',
  '..',
  'packages',
  'angular',
  'src',
  'index.ts'
)

function getChronousAngularAlias() {
  const packagePath = process.env.CHRONOUS_ANGULAR_PACKAGE?.trim()
  if (!packagePath) return CHRONOUS_ANGULAR_SOURCE

  const packageDirectory = resolve(packagePath)
  if (
    !existsSync(packageDirectory) ||
    !statSync(packageDirectory).isDirectory()
  ) {
    throw new Error(
      `CHRONOUS_ANGULAR_PACKAGE must point to an extracted package directory: ${packageDirectory}`
    )
  }

  const packageJsonPath = resolve(packageDirectory, 'package.json')
  if (!existsSync(packageJsonPath)) {
    throw new Error(
      `CHRONOUS_ANGULAR_PACKAGE is missing package.json: ${packageJsonPath}`
    )
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  if (typeof packageJson.module !== 'string' || !packageJson.module.trim()) {
    throw new Error(
      `The package at ${packageDirectory} must declare a "module" entry`
    )
  }

  const moduleEntry = resolve(packageDirectory, packageJson.module)
  if (!existsSync(moduleEntry)) {
    throw new Error(`The package module entry does not exist: ${moduleEntry}`)
  }

  return moduleEntry
}

export default defineConfig({
  base: './',
  resolve: {
    alias: [
      {
        find: /^@midstem\/chronous-angular$/,
        replacement: getChronousAngularAlias()
      }
    ]
  },
  plugins: [
    angular({ tsconfig: resolve(__dirname, 'tsconfig.json') }),
    tailwindcss()
  ],
  server: { open: true, port: 5174 },
  test: {
    environment: 'node',
    include: ['src/**/__test__/**/*.test.ts'],
    passWithNoTests: true
  }
})
