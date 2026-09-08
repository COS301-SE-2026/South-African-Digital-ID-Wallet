import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://api-flashid-dev.azurewebsites.net';

export const options = { vus: 1, iterations: 1 };

export default function () {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: 'nfr-citizen-00@flashid.local', password: 'password123' }),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'mobile',
        'X-Device-Token': 'nfr-k6-device-00',
      },
    }
  );
  check(res, { 'cold start still 200': (r) => r.status === 200 });
  console.log(`cold-start login latency: ${res.timings.duration}ms`);
}