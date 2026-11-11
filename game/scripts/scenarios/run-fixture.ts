import { fixtureProvider, makeFixtureScenario } from './fixture-scenario';
import { runScenario } from './runner';

const report = runScenario(fixtureProvider, makeFixtureScenario());
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.passed ? 0 : 1;
