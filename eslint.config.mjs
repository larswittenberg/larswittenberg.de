import nextConfig from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

export default [
  ...nextConfig,
  prettier,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react/no-unescaped-entities": ["error", {
        forbid: [">", "}"],
      }],
    },
  }
];