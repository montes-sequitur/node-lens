import test from 'node:test';
import assert from 'node:assert/strict';
import { runDiagnostics, renderHtml, formatCliReport } from '../src/index';

test('Node.js Environment Verification Suite (TypeScript)', async (t) => {
  await t.test('runDiagnostics() should return valid runtime, system and env info', async () => {
    const report = await runDiagnostics();

    assert.ok(report.timestamp, 'Should include timestamp');
    assert.strictEqual(typeof report.durationMs, 'number');
    assert.strictEqual(report.node.version, process.version);
    assert.strictEqual(report.node.arch, process.arch);
    assert.strictEqual(report.node.platform, process.platform);
    assert.ok(Array.isArray(report.node.globalPackages), 'Should report global packages array');

    assert.ok(report.environment.nodeEnv, 'Should report NODE_ENV');
    assert.strictEqual(typeof report.environment.hasDotEnv, 'boolean');
    assert.ok(report.environment.totalEnvVars >= 0, 'Should report total environment variables');

    if (process.platform === 'darwin' && process.arch === 'arm64') {
      assert.strictEqual(report.node.isAppleSilicon, true);
    }

    assert.ok(report.node.versions.v8, 'Should report V8 version');
    assert.ok(report.node.versions.openssl, 'Should report OpenSSL version');
    assert.ok(report.system.cpuCores > 0, 'Should report CPU core count');
    assert.ok(report.system.memory.totalMB > 0, 'Should report total RAM');
  });

  await t.test('Essential subsystem tests (FS, Crypto, Async) should pass', async () => {
    const report = await runDiagnostics();

    assert.strictEqual(report.tests.filesystem.status, 'PASS', 'FS test status should be PASS');
    assert.strictEqual(report.tests.crypto.status, 'PASS', 'Crypto test status should be PASS');
    assert.strictEqual(report.tests.eventLoop.status, 'PASS', 'Event Loop test status should be PASS');
    assert.strictEqual(report.allEssentialPassed, true, 'allEssentialPassed should be true');
  });

  await t.test('renderHtml() should generate a complete HTML dashboard', async () => {
    const report = await runDiagnostics();
    const html = renderHtml(report);

    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('Node.js Environment Diagnostics'));
    assert.ok(html.includes(report.node.version));
    assert.ok(html.includes('/api/status'));
  });

  await t.test('formatCliReport() should generate a formatted CLI terminal report', async () => {
    const report = await runDiagnostics();
    const cliOutput = formatCliReport(report);

    assert.ok(cliOutput.includes('NODE.JS ENVIRONMENT DIAGNOSTICS'));
    assert.ok(cliOutput.includes(report.node.version));
  });
});
