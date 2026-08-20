import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default [
  {
    ignores: [
      'eslint.config.js',
      '**/vite.config.ts',
      '**/scripts/**',
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**'
    ]
  },

  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  ...tsPlugin.configs['flat/recommended-type-checked'],

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname
      },
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      },
      react: { version: 'detect' }
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [1, { ignoreRestSiblings: true }],
      '@typescript-eslint/no-use-before-define': 'off',
      'no-redeclare': 'off',
      'no-undef': 'off',
      'no-shadow': 'off',
      'no-debugger': 1,
      'no-use-before-define': 'off',
      'no-console': 'warn',
      'no-param-reassign': [2, { props: false }],
      'no-restricted-syntax': [
        2,
        'ForInStatement',
        'LabeledStatement',
        'WithStatement'
      ],
      'prefer-const': ['error', { destructuring: 'all' }],
      'import/no-extraneous-dependencies': 0,
      'import/prefer-default-export': 0,
      'import/extensions': 0,
      'max-len': 0,
      'react/react-in-jsx-scope': 0,
      'react/prop-types': 0,
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-curly-brace-presence': ['error', 'never'],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },

  {
    files: ['**/*.mjs'],
    rules: tsPlugin.configs['flat/disable-type-checked'].rules,
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    }
  },

  prettierRecommended
]
