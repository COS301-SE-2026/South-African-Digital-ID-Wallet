import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://api-flashid-dev-bjgng2dxd6hrgbca.southafricanorth-01.azurewebsites.net';

export const options = {
  scenarios: {
      auth_latency: {
      // 8 logins a minute stays under the deployed 10 per minute per IP login limit (NFR1.9)
      executor: 'constant-arrival-rate',
      rate: 8,
      timeUnit: '1m',
      duration: '3m',
      preAllocatedVUs: 2,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // NFR2.2
    http_req_failed: ['rate<0.01'],
  },
};

export default function main() {
  const i = (__VU - 1) % 10; // one dedicated NFR citizen per VU, no cross-VU collisions
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: `nfr-citizen-${String(i).padStart(2, '0')}@flashid.local`, password: 'password123' }),
    { 
        headers: 
        { 
            'Content-Type': 'application/json', 
            'X-Client': 'mobile',
            'X-Device-Token': `nfr-k6-device-${String(i).padStart(2, '0')}`, 
        },
    }
  );
  check(res, { 'login 200 with token': (r) => r.status === 200 && !!r.json('token') });
  sleep(2);
}