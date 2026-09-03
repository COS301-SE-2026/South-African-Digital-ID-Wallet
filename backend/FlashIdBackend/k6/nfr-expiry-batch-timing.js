import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://api-flashid-dev.azurewebsites.net';

export const options =  { vus: 1, iterations: 1 };

export default function () {
  const loginRes =  http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: 'nfr-govadmin@flashid.local', password: 'password123' }),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'mobile',
        'X-Device-Token': 'nfr-k6-device-govadmin',
      },
    }
  );
  const token =  loginRes.json('token');

  const res =  http.post(`${BASE_URL}/api/credentials/expiry-check`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  check(res, { 'expiry-check ran': (r) =>  r.status ===  200 || r.status ===  409 });
  console.log(`expiry-check duration at current seed volume: ${res.timings.duration}ms`);
}