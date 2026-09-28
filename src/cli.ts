import pc from 'picocolors';
import { DiagnosticReport, SubsystemStatus } from './types';

const getBadge = (s: SubsystemStatus): string =>
  s === 'PASS'
    ? pc.green('[✔ PASS]')
    : s === 'WARN'
      ? pc.yellow('[⚠ WARN]')
      : pc.red('[✖ FAIL]');

export const formatCliReport = (r: DiagnosticReport): string => {
  const { node, system, environment, tests, allEssentialPassed } = r;
  const globalPkgsText = node.globalPackages.length
    ? node.globalPackages.map((p) => `${p.name}@${p.version}`).join(', ')
    : 'None detected';

  const isApple = node.isAppleSilicon ? pc.green('(Native Apple Silicon)') : '';
  const dotEnvText = environment.hasDotEnv ? pc.green('Found (.env)') : pc.yellow('Not found');

  return [
    `\n${pc.bold(pc.cyan('===================================================='))}`,
    `${pc.bold(pc.cyan('   NODE.JS ENVIRONMENT DIAGNOSTICS & VERIFICATION   '))}`,
    `${pc.bold(pc.cyan('===================================================='))}\n`,
    `${pc.bold('Runtime Information:')}`,
    `  • Node Version:       ${pc.green(node.version)}`,
    `  • Architecture:       ${pc.cyan(node.arch)} ${isApple}`,
    `  • Platform:           ${node.platform} (${system.type} ${system.release})`,
    `  • Executable Path:    ${node.execPath}`,
    `  • Components:         V8: ${node.versions.v8} | OpenSSL: ${node.versions.openssl} | UV: ${node.versions.uv}`,
    `  • Global Packages:    ${pc.green(globalPkgsText)}`,
    `\n${pc.bold('Environment Configuration:')}`,
    `  • NODE_ENV:           ${pc.green(environment.nodeEnv)}`,
    `  • .env File:          ${dotEnvText}`,
    `  • Total Env Vars:     ${environment.totalEnvVars} loaded`,
    `\n${pc.bold('Hardware & Resources:')}`,
    `  • Processor:          ${system.cpuModel} (${system.cpuCores} cores)`,
    `  • RAM Memory:         ${system.memory.usedMB} MB / ${system.memory.totalMB} MB (${system.memory.freeMB} MB free)`,
    `  • Process RSS:        ${system.memory.processRssMB} MB RSS`,
    `\n${pc.bold('Subsystem Tests:')}`,
    `  ${getBadge(tests.filesystem.status)} File System (fs) [${tests.filesystem.latencyMs}ms]: ${tests.filesystem.details}`,
    `  ${getBadge(tests.crypto.status)} Cryptography (OpenSSL) [${tests.crypto.latencyMs}ms]: ${tests.crypto.details}`,
    `  ${getBadge(tests.eventLoop.status)} Event Loop (Async) [${tests.eventLoop.latencyMs}ms]: ${tests.eventLoop.details}`,
    `  ${getBadge(tests.network.status)} Network Connectivity [${tests.network.latencyMs}ms]: ${tests.network.details}`,
    `\n${pc.bold('Global Status:')} ${allEssentialPassed ? pc.bold(pc.green('✔ Node.js environment validated successfully')) : pc.bold(pc.red('✖ Errors detected in essential tests'))}\n`
  ].join('\n');
};
