import runSchemConvert from './runSchemConvert.js';

export async function convertNbtToLitematic(inputPath, outputPath) {
  await runSchemConvert(inputPath, outputPath, 'litematic');
}
