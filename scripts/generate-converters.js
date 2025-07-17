import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.join(__dirname, '..', 'converter');

const formats = ['litematic', 'schem', 'nbt', 'bp'];

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function generate() {
  await fs.mkdir(targetDir, { recursive: true });
  const exports = ["import runSchemConvert from './runSchemConvert.js';\n"];

  for (const from of formats) {
    for (const to of formats) {
      if (from === to) continue;
      const func = `convert${cap(from)}To${cap(to)}`;
      const content = `import runSchemConvert from './runSchemConvert.js';\n\nexport async function ${func}(inputPath, outputPath) {\n  await runSchemConvert(inputPath, outputPath, '${to}');\n}\n`;
      const fileName = `${from}To${to}.js`;
      await fs.writeFile(path.join(targetDir, fileName), content);
      exports.push(`export { ${func} } from './${fileName}';`);
    }
  }
  await fs.writeFile(path.join(targetDir, 'index.js'), exports.join('\n'));
  console.log('Converter modules generated in', targetDir);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
