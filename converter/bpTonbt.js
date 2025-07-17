import runSchemConvert from './runSchemConvert.js';

export async function convertBpToNbt(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'nbt');
}
