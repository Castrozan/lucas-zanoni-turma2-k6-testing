import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

export const getComputersDuration = new Trend('get_contacts', true);

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['avg<10000']
  },
  stages: [{ duration: '1m', target: 1000 }]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://computer-database.gatling.io/computers';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getComputersDuration.add(res.timings.duration);

  check(res, {
    'get computers - status 200': () => res.status === OK
  });
}
