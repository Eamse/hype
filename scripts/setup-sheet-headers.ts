import { google } from 'googleapis';
import path from 'path';
const SHEET_ID = '1HwYaGV4HpLmxChqE3_-Duc7jHgnmJw_ExwfOwXZ5Vds';
const KEY_FILE = path.join(process.cwd(), 'google-service-account.json');
const HEADERS: Record<string, string[]> = {
    '1_directors': ['number', 'name', 'instagram', 'location'],
    '2_packages': [
        'packageId',
        'directorNumber',
        'name',
        'subtitle',
        'priceSNS',
        'priceNoSNS',
        'shootingTime',
        'locations',
        'originalPhotos',
        'retouched',
        'retouchedDetail',
    ],
    '3_inclusions': ['packageId', 'item'],
    '4_addons': ['packageId', 'name', 'price', 'desc'],
    '5_partners': ['packageId', 'role', 'name', 'instagram'],
    '6_bouquet': ['packageId', 'name', 'instagram'],
};
async function main() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    for (const [tabName, headers] of Object.entries(HEADERS)) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${tabName}!A1`,
            valueInputOption: 'RAW',
            requestBody: { values: [headers] },
        });
        console.log(`✅ ${tabName} 헤더 작성 완료:`, headers.join(', '));
    }
}
main().catch((err) => {
    console.error('❌ 실패:', err.message);
    process.exit(1);
});
