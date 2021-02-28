const { NODE_ENV = '' } = process.env

const isEnvProduction = NODE_ENV === 'production'

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    'plugin:vue/strongly-recommended',
    'plugin:vue/recommended',
    '@vue/prettier'
  ],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2020
  },
  plugins: ['sort-exports', 'sort-destructure-keys'],
  rules: {
    'no-console': isEnvProduction ? 'error' : 'warn',
    'no-debugger': isEnvProduction ? 'error' : 'warn',
    'no-unreachable': isEnvProduction ? 'error' : 'warn',

    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'comma-dangle': ['error', 'never'],
    'sort-imports': isEnvProduction ? 'error' : 'warn',
    'sort-destructure-keys/sort-destructure-keys': ['error'],
    'no-unused-vars': [
      isEnvProduction ? 'error' : 'warn',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_', args: 'all' }
    ],

    'sort-exports/sort-exports': ['error', { sortDir: 'asc' }],

    // Vue specific
    'vue/no-unused-vars': [isEnvProduction ? 'error' : 'warn', { ignorePattern: '^_' }],
    'vue/require-prop-type-constructor': 'error',
    'vue/require-default-prop': 'error',
    'vue/prop-name-casing': 'error',
    'vue/order-in-components': 'error',
    'vue/custom-event-name-casing': ['error', { ignores: ['/^[a-z]+(?:-[a-z]+)*:[a-z]+(?:-[a-z]+)*$/u'] }],
    'vue/attributes-order': [
      'warn',
      {
        order: [
          /*
            DEFINITION e.g. 'is', 'v-is'
            LIST_RENDERING e.g. 'v-for item in items'
            CONDITIONALS e.g. 'v-if', 'v-else-if', 'v-else', 'v-show', 'v-cloak'
            RENDER_MODIFIERS e.g. 'v-once', 'v-pre'
            GLOBAL e.g. 'id'
            UNIQUE e.g. 'ref', 'key', 'v-slot', 'slot'
            TWO_WAY_BINDING e.g. 'v-model'
            OTHER_DIRECTIVES e.g. 'v-custom-directive'
            OTHER_ATTR e.g. 'custom-prop="foo"', 'v-bind:prop="foo"', ':prop="foo"'
            EVENTS e.g. '@click="functionCall"', 'v-on="event"'
            CONTENT e.g. 'v-text', 'v-html'
          */
          ['DEFINITION', 'UNIQUE', 'GLOBAL'],
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'OTHER_ATTR',
          'EVENTS',
          ['LIST_RENDERING', 'RENDER_MODIFIERS', 'CONTENT', 'CONDITIONALS']
        ],
        alphabetical: false
      }
    ]
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true
      }
    }
  ]
}