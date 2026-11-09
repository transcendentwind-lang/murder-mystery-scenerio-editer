import { rm, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
if (process.env.NEXT_PUBLIC_STATIC_EXPORT === '1') {
  await rm('out/local-projects.json', { force: true });
  // 目録にないGM用資料・原本・比較用PDFが残っていたら配信を止める。
  const allowed = new Set();
  for (const scenario of await readdir('assets/scenarios')) {
    const manifest = JSON.parse(await readFile(`assets/scenarios/${scenario}/manifest.json`, 'utf8'));
    for (const file of manifest.files.filter((file) => file.participantApp)) {
      allowed.add(`scenarios/${scenario}/${file.path}`);
      if (file.legacyUrl) allowed.add(file.legacyUrl.slice(1));
    }
  }
  async function verify(dir) {
    let entries; try { entries = await readdir(path.join('out', dir), { withFileTypes: true }); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const entry of entries) {
      const relative = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await verify(relative);
      else if (!allowed.has(relative)) throw new Error(`参加者向けの公開対象外資料: ${relative}`);
    }
  }
  for (const dir of ['scenarios', 'images', 'pdfs']) await verify(dir);
  console.log('参加者向け配信物の資料範囲を確認済み');
}
