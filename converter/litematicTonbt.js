import runSchemConvert from './runSchemConvert.js';

export async function convertLitematicToNbt(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'nbt');
}
