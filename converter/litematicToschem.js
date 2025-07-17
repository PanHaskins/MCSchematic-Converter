import runSchemConvert from './runSchemConvert.js';

export async function convertLitematicToSchem(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'schem');
}
