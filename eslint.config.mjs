import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextConfig from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

export default [...nextCoreWebVitals, ...nextConfig, prettier, {
  files: ["**/*.{js,jsx,ts,tsx}"],
  rules: {
    "react/no-unescaped-entities": ["error", {
      forbid: [">", "}"],
    }],
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}];