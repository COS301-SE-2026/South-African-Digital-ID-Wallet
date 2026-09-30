import http from 'k6/http';
import exec from 'k6/execution';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://api-flashid-dev-bjgng2dxd6hrgbca.southafricanorth-01.azurewebsites.net';
const ACCOUNTS = 10;

export const options = {
  scenarios: {
    ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      // hold each level for 60 s so each one gets its own p95
      stages: [
        { duration: '20s', target: 10 }, { duration: '60s', target: 10 },
        { duration: '20s', target: 25 }, { duration: '60s', target: 25 },
        { duration: '20s', target: 50 }, { duration: '60s', target: 50 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    // one p95 per load level so the summary shows where it crosses 2 s (NFR2.3 target)
    'http_req_duration{level:10}': ['p(95)<2000'],
    'http_req_duration{level:25}': ['p(95)<2000'],
    'http_req_duration{level:50}': ['p(95)<2000'],
  },
};

// log each test account in once and share the tokens: a login per VU would trip the 10 per minute per IP limit (NFR1.9)
export function setup() {
  const tokens = [];
  for (let i = 0; i < ACCOUNTS; i++) {
    const res = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email: `nfr-citizen-${String(i).padStart(2, '0')}@flashid.local`, password: 'password123' }),
      { headers: { 'Content-Type': 'application/json', 'X-Client': 'mobile', 'X-Device-Token': `nfr-k6-device-${String(i).padStart(2, '0')}` } }
    );
    tokens.push(res.json('token'));
  }
  return { tokens };
}

export default function main(data) {
  const token = data.tokens[(__VU - 1) % ACCOUNTS];
  // tag each request with the load level it ran under
  const active = exec.instance.vusActive;
  const level = active <= 10 ? '10' : active <= 25 ? '25' : '50';
  const res = http.get(`${BASE_URL}/api/credentials/mine`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { level },
  });
  check(res, { 'credentials 200': (r) => r.status === 200 });
  sleep(2);
}
