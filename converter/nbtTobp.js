import runSchemConvert from './runSchemConvert.js';

export async function convertNbtToBp(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'bp');
}
