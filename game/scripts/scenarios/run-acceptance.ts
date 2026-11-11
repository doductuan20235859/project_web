import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { runAcceptance } from './acceptance';
import type { AcceptanceProvider } from './acceptance';
import fixtureProvider from './fixture-acceptance';

const { values } = parseArgs({
  options: { provider: { type: 'string' }, output: { type: 'string', default: 'test-results/acceptance/report.json' } },
});
const provider: AcceptanceProvider = values.provider
  ? (await import(pathToFileURL(resolve(values.provider)).href)).default
  : fixtureProvider;
const report = await runAcceptance(provider);
const output = resolve(values.output);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ provider: report.provider, passed: report.passed, output }, null, 2));
process.exitCode = report.passed ? 0 : 1;
