import * as fs from 'fs/promises';
import * as path from 'path';
import { Command } from 'commander';
import { runDiagnostics } from './diagnostics';
import { formatCliReport } from './cli';
import { renderHtml } from './html';
import { startServer } from './server';

const program = new Command();

program
  .name('ping')
  .description('Node.js Environment Verification CLI')
  .version('1.0.0')
  .option('-c, --check', 'Run initial diagnostics check')
  .option('-j, --json', 'Output report in raw JSON format')
  .option('-o, --output <file>', 'Save diagnostic report JSON to disk')
  .option('-p, --port <number>', 'Custom HTTP server port', (v) => Number(v));

if (require.main === module) {
  program.parse(process.argv);
  const opts = program.opts<{
    check?: boolean;
    json?: boolean;
    output?: string;
    port?: number;
  }>();

  if (opts.check || opts.json || opts.output) {
    runDiagnostics()
      .then(async (report) => {
        if (opts.output) {
          const targetPath = path.resolve(process.cwd(), opts.output);
          await fs.writeFile(targetPath, JSON.stringify(report, null, 2), 'utf-8');
          console.log(`\n✔ Diagnostic report saved to: ${targetPath}`);
        }

        if (opts.json) {
          console.log(JSON.stringify(report, null, 2));
        } else {
          console.log(formatCliReport(report));
        }

        process.exit(report.allEssentialPassed ? 0 : 1);
      })
      .catch((err) => {
        console.error('Error during verification:', err);
        process.exit(1);
      });
  } else {
    startServer(opts.port);
  }
}

export { runDiagnostics, renderHtml, formatCliReport, startServer };
