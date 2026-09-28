import fs from 'fs';
import path from 'path';
import h from 'vhtml';
import { DiagnosticReport, SubsystemResult } from './types';

const renderRow = (label: string, val: string | number) =>
  h(
    'div',
    { class: 'info-row' },
    h('span', { class: 'info-label' }, label),
    h('span', { class: 'info-val' }, String(val))
  );

const renderTest = (title: string, res: SubsystemResult, isLast = false) =>
  h(
    'div',
    { class: 'test-item', style: isLast ? 'border-bottom: none;' : undefined },
    h(
      'div',
      { class: 'test-header' },
      h('span', { class: 'test-title' }, title),
      h(
        'span',
        { class: `badge ${res.status.toLowerCase()}` },
        res.status === 'PASS' ? '✔ PASSED' : res.status === 'WARN' ? '⚠ WARNING' : '✖ FAILED'
      )
    ),
    h('div', { class: 'test-details' }, res.details)
  );

export const renderHtml = (report: DiagnosticReport): string => {
  const { node, system, environment, tests, allEssentialPassed, timestamp, durationMs } = report;
  const pkgs = node.globalPackages.length
    ? node.globalPackages.map((p) => `${p.name}@${p.version}`).join(', ')
    : 'None detected';

  const statusPillClass = allEssentialPassed ? 'status-pill pass' : 'status-pill fail';
  const statusPillText = allEssentialPassed ? '● Installation Verified' : '● Attention Required';
  const dotEnvBadge = environment.hasDotEnv ? '✔ Present' : '✖ Not Found';

  let embeddedCss = '';
  try {
    const cssPath = path.join(process.cwd(), 'public', 'style.css');
    embeddedCss = fs.readFileSync(cssPath, 'utf-8');
  } catch {
    embeddedCss = '';
  }

  const bodyContent = h(
    'div',
    { class: 'container' },
    h(
      'header',
      null,
      h(
        'div',
        null,
        h('h1', null, 'Node.js Environment Diagnostics'),
        h(
          'p',
          { style: 'color: var(--text-muted); font-size: 0.875rem;' },
          'System installation & subsystem verification'
        )
      ),
      h('div', { class: statusPillClass }, statusPillText)
    ),
    h(
      'div',
      { class: 'grid' },
      h(
        'div',
        { class: 'card' },
        h('h2', null, '🚀 Node.js Runtime & Env'),
        renderRow('Node Version:', node.version),
        renderRow(
          'Architecture:',
          `${node.arch} ${node.isAppleSilicon ? '🍏 (Apple Silicon)' : ''}`
        ),
        renderRow('NODE_ENV:', environment.nodeEnv),
        renderRow('.env File:', dotEnvBadge),
        renderRow('Total Env Vars:', environment.totalEnvVars),
        renderRow('Global Packages:', pkgs),
        renderRow('Executable Path:', node.execPath)
      ),
      h(
        'div',
        { class: 'card' },
        h('h2', null, '💻 System & Resources'),
        renderRow('Platform:', `${node.platform} (${system.type})`),
        renderRow('Processor:', system.cpuModel),
        renderRow('CPU Cores:', system.cpuCores),
        renderRow('RAM Memory:', `${system.memory.usedMB} MB / ${system.memory.totalMB} MB`),
        renderRow('Node RSS Usage:', `${system.memory.processRssMB} MB`),
        renderRow('System Uptime:', `${system.uptimeHours} hours`)
      )
    ),
    h(
      'div',
      { class: 'card' },
      h('h2', null, '🧪 Subsystem Tests'),
      renderTest(`1. File System (fs/promises) [${tests.filesystem.latencyMs} ms]`, tests.filesystem),
      renderTest(`2. Cryptography & Hashing (crypto) [${tests.crypto.latencyMs} ms]`, tests.crypto),
      renderTest(`3. Event Loop & Async [${tests.eventLoop.latencyMs} ms]`, tests.eventLoop),
      renderTest(
        `4. Network Connectivity (DNS & HTTPS Fetch) [${tests.network.latencyMs} ms]`,
        tests.network,
        true
      )
    ),
    h(
      'footer',
      null,
      h('span', null, `Verified at: ${timestamp} (Duration: ${durationMs}ms)`),
      h(
        'div',
        null,
        h('a', { class: 'btn', href: '/api/status', target: '_blank' }, 'View JSON'),
        h('a', { class: 'btn', href: '/', style: 'margin-left: 0.5rem;' }, 'Reload')
      )
    )
  );

  const documentTree = h(
    'html',
    { lang: 'en' },
    h(
      'head',
      null,
      h('meta', { charset: 'UTF-8' }),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }),
      h('title', null, 'Node.js Environment Verification'),
      h('link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }),
      h('link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }),
      h('link', {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap'
      }),
      h('link', { rel: 'stylesheet', href: '/style.css' }),
      h('style', null, embeddedCss)
    ),
    h('body', null, bodyContent)
  );

  return `<!DOCTYPE html>\n${documentTree}`;
};
