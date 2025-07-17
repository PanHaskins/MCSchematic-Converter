import runSchemConvert from './runSchemConvert.js';

export async function convertLitematicToBp(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'bp');
}
