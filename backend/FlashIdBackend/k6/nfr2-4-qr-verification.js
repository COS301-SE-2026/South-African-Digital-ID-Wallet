import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL =  __ENV.BASE_URL || 'https://api-flashid-dev.azurewebsites.net';

const MANDATORY_FIELDS =  {
  'Identity Document': ['Date of birth', 'Photograph'],
  "Driver's License": ['Photo', 'Expiry date', 'Date of birth'],
};

export const options =  {
  scenarios: {
    qr_verification: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 5 },
        { duration: '30s', target: 5 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    'http_req_duration{endpoint:qr_resolve}': ['p(95)<3000'], //  NFR2.4
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const i =  (__VU - 1) % 10;
  const loginRes =  http.post(
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
  const token =  loginRes.json('token');
  if (!token) { sleep(2); return; }
  const auth =  { Authorization: `Bearer ${token}` };

  const credRes =  http.get(`${BASE_URL}/api/credentials/mine`, { headers: auth });
  const credentials =  credRes.json();
  if (!Array.isArray(credentials) || credentials.length === 0) { sleep(2); return; }

  const cred =  credentials[0];
  const disclosedFields =  MANDATORY_FIELDS[cred.credentialType];

  const qrRes =  http.post(
    `${BASE_URL}/api/credentials/${cred.id}/qr-token`,
    JSON.stringify({ disclosedFields }),
    { headers: { ...auth, 'Content-Type': 'application/json' } }
  );
  const qrToken =  qrRes.json('token');

  if (qrToken) {
    const resolveRes =  http.post(
      `${BASE_URL}/api/credentials/resolve`,
      JSON.stringify({ token: qrToken }),
      { headers: { ...auth, 'Content-Type': 'application/json' }, tags: { endpoint: 'qr_resolve' } }
    );
    check(resolveRes, { 'resolve 200': (r) =>  r.status === 200 });
  }

  sleep(2);
}