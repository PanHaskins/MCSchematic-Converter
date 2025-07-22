import { expect } from 'chai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { installJava } from '../scripts/install-java.js';
import runSchemConvert from '../converter/runSchemConvert.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const outDir = path.join(__dirname, 'output');
// Only include files that SchemConvert reliably supports
const samples = ['25423.litematic', 'house.schem'];

describe('SchemConvert sample files', function() {
  this.timeout(120000);

  before(async function() {
    await fs.mkdir(outDir, { recursive: true });
    const result = await installJava();
    if (!result.success) {
      throw new Error('Java installation failed: ' + result.error);
    }
    process.env.JAVA_PATH = result.javaPath;
  });

  after(async function() {
    await fs.rm(outDir, { recursive: true, force: true });
  });

  for (const sample of samples) {
    it(`converts ${sample} to nbt`, async function() {
      const input = path.join(dataDir, sample);
      const base = path.parse(sample).name;
      const output = path.join(outDir, base + '.nbt');
      await runSchemConvert(input, output, 'nbt');
      const stat = await fs.stat(output);
      expect(stat.size).to.be.greaterThan(0);
    });
  }
});
