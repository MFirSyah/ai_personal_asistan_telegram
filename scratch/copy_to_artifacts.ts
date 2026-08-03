import * as fs from 'fs';
import * as path from 'path';

const artifactsDir = 'C:\\Users\\mfirm\\.gemini\\antigravity-ide\\brain\\45f84934-d81f-40c2-a46b-ae2636715e54';
const publicDir = path.join(__dirname, '../public');

fs.copyFileSync(path.join(publicDir, 'Export_Transaksi_Juni_2026.csv'), path.join(artifactsDir, 'Export_Transaksi_Juni_2026.csv'));
fs.copyFileSync(path.join(publicDir, 'Export_Aktivitas_Juni_2026.csv'), path.join(artifactsDir, 'Export_Aktivitas_Juni_2026.csv'));

console.log('Files copied to artifacts directory!');
