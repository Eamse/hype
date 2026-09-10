import 'dotenv/config';
import { getDriveClient } from './sheets-client';
async function main() {
    const drive = await getDriveClient();
    const res = await drive.files.list({
        q: "'1J_fPA8x9jkS56v4OZ4Dw-fW0xOrlcBg4' in parents and trashed = false",
        fields: 'files(id, name, mimeType)',
        pageSize: 100,
        orderBy: 'name',
    });
    console.log(JSON.stringify(res.data.files, null, 2));
}
main().catch((err) => {
    console.error('실패:', err.message);
    process.exit(1);
});
