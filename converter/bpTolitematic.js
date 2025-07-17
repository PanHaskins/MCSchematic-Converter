import runSchemConvert from './runSchemConvert.js';

export async function convertBpToLitematic(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'litematic');
}
