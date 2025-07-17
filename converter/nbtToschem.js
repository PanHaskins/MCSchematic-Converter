import runSchemConvert from './runSchemConvert.js';

export async function convertNbtToSchem(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'schem');
}
