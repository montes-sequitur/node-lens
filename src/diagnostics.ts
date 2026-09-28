import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import dns from 'dns/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import {
  DiagnosticReport,
  EnvInfo,
  GlobalPackage,
  NodeRuntimeInfo,
  SubsystemResult,
  SystemResourceInfo
} from './types';

const execFileAsync = promisify(execFile);

const checkSubsystem = async (
  fn: () => Promise<string>,
  warnOnErr = false
): Promise<SubsystemResult> => {
  const t0 = performance.now();
  try {
    return { status: 'PASS', latencyMs: Math.round(performance.now() - t0), details: await fn() };
  } catch (err) {
    const message = (err as Error).message || String(err);
    return {
      status: warnOnErr ? 'WARN' : 'FAIL',
      latencyMs: Math.round(performance.now() - t0),
      details: message
    };
  }
};

const testFilesystem = async (): Promise<string> => {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(
    tmpDir,
    `ping_${Date.now()}_${Math.random().toString(36).slice(2)}.tmp`
  );
  const val = `ping_${Date.now()}`;
  await fs.writeFile(tmpFile, val, 'utf-8');
  const read = await fs.readFile(tmpFile, 'utf-8');
  await fs.unlink(tmpFile);
  if (read !== val) throw new Error('Read content does not match written content');
  return 'File write, read, and deletion in temp directory succeeded';
};

const testCrypto = async (): Promise<string> => {
  const hash = crypto.createHash('sha256').update('antigravity-node-check').digest('hex');
  const uuid = crypto.randomUUID();
  if (!hash || uuid.length !== 36) throw new Error('Invalid cryptographic generation');
  return `SHA-256 and UUID (${uuid.slice(0, 8)}...) successfully validated`;
};

const testEventLoop = async (): Promise<string> => {
  await new Promise<void>((r) => setImmediate(r));
  return 'Microtasks and setImmediate resolved without delay';
};

const testNetwork = async (): Promise<string> => {
  const d = await dns.lookup('nodejs.org');
  const res = await fetch('https://nodejs.org', {
    method: 'HEAD',
    signal: AbortSignal.timeout(4000)
  });
  return `DNS resolved (${d.address}) and HTTPS connection to nodejs.org (${res.status} ${res.statusText})`;
};

const getGlobalPackages = async (): Promise<GlobalPackage[]> => {
  try {
    const { stdout } = await execFileAsync('npm', ['list', '-g', '--depth=0', '--json'], {
      timeout: 4000
    });
    const parsed = JSON.parse(stdout);
    const deps = parsed.dependencies || {};
    return Object.entries(deps).map(([pkgName, info]) => ({
      name: pkgName,
      version: (info as { version?: string })?.version || 'unknown'
    }));
  } catch {
    return [];
  }
};

const getEnvInfo = async (): Promise<EnvInfo> => {
  const dotEnvResult = dotenv.config();
  const hasDotEnv = !dotEnvResult.error;

  return {
    nodeEnv: process.env.NODE_ENV || 'development (not set)',
    hasDotEnv,
    totalEnvVars: Object.keys(process.env).length
  };
};

const getNodeInfo = (globalPackages: GlobalPackage[]): NodeRuntimeInfo => ({
  version: process.version,
  arch: process.arch,
  platform: process.platform,
  isAppleSilicon: process.platform === 'darwin' && process.arch === 'arm64',
  execPath: process.execPath,
  versions: process.versions,
  globalPackages
});

const getSystemInfo = (): SystemResourceInfo => {
  const total = Math.round(os.totalmem() / 1048576);
  const free = Math.round(os.freemem() / 1048576);
  const cpus = os.cpus();
  const rssMB = Math.round(process.memoryUsage().rss / 1048576);
  return {
    hostname: os.hostname(),
    type: os.type(),
    release: os.release(),
    cpuModel: cpus[0]?.model || 'Unknown',
    cpuCores: cpus.length,
    memory: { totalMB: total, freeMB: free, usedMB: total - free, processRssMB: rssMB },
    uptimeHours: (os.uptime() / 3600).toFixed(2)
  };
};

export const runDiagnostics = async (): Promise<DiagnosticReport> => {
  const startTime = Date.now();
  const [filesystem, cryptoRes, eventLoop, network, globalPackages, environment] =
    await Promise.all([
      checkSubsystem(testFilesystem),
      checkSubsystem(testCrypto),
      checkSubsystem(testEventLoop),
      checkSubsystem(testNetwork, true),
      getGlobalPackages(),
      getEnvInfo()
    ]);

  const allPassed =
    filesystem.status === 'PASS' &&
    cryptoRes.status === 'PASS' &&
    eventLoop.status === 'PASS';

  return {
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    allEssentialPassed: allPassed,
    node: getNodeInfo(globalPackages),
    system: getSystemInfo(),
    environment,
    tests: { filesystem, crypto: cryptoRes, eventLoop, network }
  };
};
