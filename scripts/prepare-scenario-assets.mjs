import { readFile, readdir, mkdir, rm, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const base = path.resolve('assets/scenarios');
const checkOnly = process.argv.includes('--check');
const participantOnly = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1' || process.argv.includes('--participant');
async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    result.push(...(entry.isDirectory() ? await walk(full) : [full]));
  }
  return result;
}
for (const scenario of await readdir(base)) {
  const root = path.join(base, scenario);
  const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
  if (manifest.scenarioId !== scenario) throw new Error(`作品ID不一致: ${scenario}`);
  const actual = (await walk(root)).map((file) => path.relative(root, file).split(path.sep).join('/')).sort();
  const registered = manifest.files.map((file) => file.path).sort();
  if (new Set(registered).size !== registered.length || JSON.stringify(actual) !== JSON.stringify(registered)) throw new Error(`資料目録に未登録・重複・欠損あり: ${scenario}`);
  const output = path.resolve('public/scenarios', scenario);
  if (!checkOnly) {
    await rm(output, { recursive: true, force: true });
    // 旧URLは同じ正本から生成する。参加者向けには公開対象だけ残す。
    for (const file of manifest.files) if (file.legacyUrl) await rm(path.resolve('public', '.' + file.legacyUrl), { force: true });
  }
  for (const file of manifest.files) {
    const source = path.resolve(root, file.path);
    if (!source.startsWith(root + path.sep)) throw new Error('不正な資料パス');
    const bytes = await readFile(source);
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (file.sha256 && hash !== file.sha256) throw new Error(`正本ハッシュ不一致: ${file.path}`);
    if (checkOnly || (participantOnly && !file.participantApp)) continue;
    const destination = path.join(output, file.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
    if (file.legacyUrl) {
      const legacy = path.resolve('public', '.' + file.legacyUrl);
      await mkdir(path.dirname(legacy), { recursive: true });
      await copyFile(source, legacy);
    }
  }
  console.log(`${scenario}: ${manifest.files.length}資料照合済み / ${checkOnly ? '検証のみ' : participantOnly ? '参加者用を配置' : '作者用を配置'}`);
}
