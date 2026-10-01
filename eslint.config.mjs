import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: ["legacy/**", "design/**", ".next/**", "node_modules/**", "src/generated/**", "next-env.d.ts"] },
];

export default config;
