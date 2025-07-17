import runSchemConvert from './runSchemConvert.js';

export async function convertSchemToBp(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'bp');
}
