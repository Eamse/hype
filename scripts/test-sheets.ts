import { google } from 'googleapis';
import path from 'path';

const SHEET_ID = '1HwYaGV4HpLmxChqE3_-Duc7jHgnmJw_ExwfOwXZ5Vds';
const KEY_FILE = path.join(process.cwd(), 'google-service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  console.log('✅ 연결 성공!');
  console.log('시트 제목:', res.data.properties?.title);
  console.log(
    '탭(시트) 목록:',
    res.data.sheets?.map((s) => s.properties?.title),
  );
}

main().catch((err) => {
  console.error('❌ 연결 실패:', err.message);
  process.exit(1);
});
