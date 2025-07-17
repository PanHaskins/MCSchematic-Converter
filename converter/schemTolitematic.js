import runSchemConvert from './runSchemConvert.js';

export async function convertSchemToLitematic(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'litematic');
}
