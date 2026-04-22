import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const raw = JSON.parse(readFileSync(join(ROOT, "config.json"), "utf-8"));

export interface Credentials {
  sid: string;
  skey: string;
}

const credentialsMap: Record<string, Credentials> = {};
for (const code of ["MC", "CN", "RA", "VA"]) {
  if (raw.mobilpay[code]) {
    credentialsMap[code] = {
      sid: raw.mobilpay[code].sid as string,
      skey: raw.mobilpay[code].skey as string,
    };
  }
}

export function getCredentials(cashCode: string): Credentials {
  const cred = credentialsMap[cashCode];
  if (!cred) throw new Error(`config.json에 ${cashCode} 인증정보가 없습니다`);
  return cred;
}

export const config = {
  apiHost: raw.mobilpay.use_test
    ? raw.mobilpay.test_host
    : raw.mobilpay.prod_host,
  prodHost: raw.mobilpay.prod_host as string,
  port: (raw.server.port as number) || 3100,
  ngrokUrl: raw.server.ngrok_url as string,
  dataDir: join(ROOT, "data"),
  viewsDir: join(ROOT, "views"),
  credentials: credentialsMap,
};

export function getBaseUrl(): string {
  return config.ngrokUrl || `http://localhost:${config.port}`;
}
