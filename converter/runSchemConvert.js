import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JAR_PATH = path.join(__dirname, '..', 'schemconvert.jar');

function getJavaCmd() {
  return process.env.JAVA_PATH || 'java';
}

/**
 * Run SchemConvert CLI tool.
 * @param {string} input - Path to input file.
 * @param {string} output - Path to output file.
 * @param {string} format - Output format extension (e.g. 'schem').
 * @returns {Promise<void>} Resolves when conversion succeeds.
 */
export default function runSchemConvert(input, output, format) {
  return new Promise((resolve, reject) => {
    const args = ['-jar', JAR_PATH, '--input', input, '--output', output, '--format', format];
    const proc = spawn(getJavaCmd(), args);
    let error = '';
    proc.on('error', err => {
      reject(err);
    });
    proc.stderr.on('data', d => { error += d.toString(); });
    proc.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(error || `SchemConvert exited with code ${code}`));
      }
    });
  });
}
