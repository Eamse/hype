import { google } from 'googleapis';
import path from 'path';

const SHEET_ID = '1HwYaGV4HpLmxChqE3_-Duc7jHgnmJw_ExwfOwXZ5Vds';
const KEY_FILE = path.join(process.cwd(), 'google-service-account.json');

export async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export { SHEET_ID };
