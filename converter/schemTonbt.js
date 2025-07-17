import runSchemConvert from './runSchemConvert.js';

export async function convertSchemToNbt(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'nbt');
}
