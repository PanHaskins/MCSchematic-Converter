import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs/promises';
import dotenv from 'dotenv';

import { installJava } from './scripts/install-java.js';
import runSchemConvert from './converter/runSchemConvert.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
const upload = multer({ dest: path.join(__dirname, 'uploads') });
const convertedDir = path.join(__dirname, 'converted');

async function prepareJava() {
  const result = await installJava();
  if (!result.success) {
    console.error('Java is required but could not be installed.');
    process.exit(1);
  }
}

async function convertFiles(files, format) {
  await fs.mkdir(convertedDir, { recursive: true });
  const converted = [];
  for (const file of files) {
    const name = path.parse(file.originalname).name;
    const outputFile = `${name}.${format}`;
    const outputPath = path.join(convertedDir, outputFile);
    await runSchemConvert(file.path, outputPath, format);
    converted.push({ filename: outputFile });
    await fs.unlink(file.path).catch(() => {});
  }
  return converted;
}

async function startServer() {
  await prepareJava();

  const app = express();
  // Enable JSON body parsing and allow cross-origin requests
  app.use(express.json());
  app.use(cors());
  const PORT = process.env.PORT || 3000;

  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/converted', express.static(convertedDir));

  app.post('/convert', upload.array('files'), async (req, res) => {
    const format = req.body.format;
    if (!['litematic', 'schem', 'nbt', 'bp'].includes(format)) {
      res.json({ success: false, error: 'Unsupported format' });
      return;
    }
    try {
      const converted = await convertFiles(req.files, format);
      res.json({ success: true, converted });
    } catch (err) {
      console.error(err);
      res.json({ success: false, error: err.message });
    }
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });
}

startServer();
