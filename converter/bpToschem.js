import runSchemConvert from './runSchemConvert.js';

export async function convertBpToSchem(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'schem');
}
