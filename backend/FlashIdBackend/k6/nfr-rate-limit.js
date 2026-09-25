import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://api-flashid-dev.azurewebsites.net';

export const options = { vus: 1, iterations: 4 };

export default function () {
  const res = http.post(
    `${BASE_URL}/api/citizens/resend-otp`,
    JSON.stringify({ email: 'nfr-citizen-00@flashid.local' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(res, { 'got a response': (r) => r.status !== 0 });
  if (__ITER === 3) {
    check(res, { '4th request in <1min is rate-limited (429)': (r) => r.status === 429 });
  }
}