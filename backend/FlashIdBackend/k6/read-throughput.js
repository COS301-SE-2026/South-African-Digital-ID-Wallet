import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://api-flashid-dev.azurewebsites.net';

export const options = {
  scenarios: {
    read_throughput: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 5 },
        { duration: '30s', target: 5 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const i = (__VU - 1) % 10;
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: `nfr-citizen-${String(i).padStart(2, '0')}@flashid.local`, password: 'password123' }),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'mobile',
        'X-Device-Token': `nfr-k6-device-${String(i).padStart(2, '0')}`,
      },
    }
  );
  const token = loginRes.json('token');
  if (!token) { sleep(2); return; }

  const res = http.get(`${BASE_URL}/api/credentials/mine`, { headers: { Authorization: `Bearer ${token}` } });
  check(res, { 'credentials ok': (r) => r.status === 200 });

  sleep(2);
}