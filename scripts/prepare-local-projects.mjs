import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const directory = path.resolve('public');
await mkdir(directory, { recursive: true });
try {
  // 排他的に作成し、既存の追加作品や同時起動時の書き込みを上書きしない。
  await writeFile(path.join(directory, 'local-projects.json'), '[]\n', { flag: 'wx' });
  console.log('ローカル追加作品の空ファイルを作成しました');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
