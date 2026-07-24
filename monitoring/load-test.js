import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '40s', target: 30 },
    { duration: '20s', target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  http.get(`${BASE_URL}/`);
  http.get(`${BASE_URL}/review`);
  http.get(`${BASE_URL}/magazine`);
  http.get(`${BASE_URL}/packages`);
  http.get(`${BASE_URL}/wedding`);
  sleep(1);
}
