import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs/promises';
import crypto from 'crypto';
import dotenv from 'dotenv';

import { installJava } from './scripts/install-java.js';
import runSchemConvert from './converter/runSchemConvert.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
const uploadsDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });
const convertedDir = path.join(__dirname, 'converted');

const SUPPORTED_FORMATS = new Set(['litematic', 'schem', 'nbt', 'bp']);

/**
 * Remove uploaded files to keep temporary storage clean.
 * This runs even if some files are already deleted.
 * @param {Array<{path: string}>} files
 */
async function cleanupUploads(files) {
  await Promise.all(files.map(f => fs.unlink(f.path).catch(() => {})));
}

/**
 * Map low-level errors to user-friendly explanations.
 * @param {Error & {code?: string}} err
 * @returns {{code: string, message: string}}
 */
function mapError(err) {
  const msg = err.message || '';
  switch (true) {
    case err.code === 'ENOENT':
      return {
        code: 'JAVA_NOT_FOUND',
        message: 'Java runtime could not be executed. Ensure Java is installed on the server.'
      };
    case /heap space/i.test(msg) || /outofmemory/i.test(msg):
      return {
        code: 'JAVA_HEAP_SPACE',
        message: 'The converter ran out of memory (Java heap space). Try converting a smaller file or increasing server memory.'
      };
    default:
      return { code: 'UNKNOWN', message: msg || 'Unknown error occurred during conversion.' };
  }
}

async function prepareJava() {
  const result = await installJava();
  if (!result.success) {
    console.error('Java is required but could not be installed.');
    process.exit(1);
  }
  process.env.JAVA_PATH = result.javaPath;
}

async function convertFiles(files, format) {
  await fs.mkdir(convertedDir, { recursive: true });

  const tasks = files.map(async (file) => {
    const base = path.parse(file.originalname).name;
    const outputFile = `${base}.${format}`;
    const outputPath = path.join(convertedDir, outputFile);

    await runSchemConvert(file.path, outputPath, format);
    await fs.unlink(file.path).catch(() => {});
    return { filename: outputFile };
  });

  return Promise.all(tasks);
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

  app.get('/formats', (_req, res) => {
    res.json({ formats: Array.from(SUPPORTED_FORMATS) });
  });

  app.post('/convert', upload.array('files'), async (req, res) => {
    const format = req.body.format;
    if (!SUPPORTED_FORMATS.has(format)) {
      await cleanupUploads(req.files);
      res.json({ success: false, error: { code: 'UNSUPPORTED_FORMAT', message: 'The selected output format is not supported.' } });
      return;
    }
    for (const f of req.files) {
      const ext = path.extname(f.originalname).slice(1).toLowerCase();
      if (!SUPPORTED_FORMATS.has(ext)) {
        await cleanupUploads(req.files);
        res.json({ success: false, error: { code: 'FILE_TYPE_NOT_SUPPORTED', message: `File type .${ext} is not supported.` } });
        return;
      }
    }
    try {
      const converted = await convertFiles(req.files, format);
      res.json({ success: true, converted });
    } catch (err) {
      console.error(err);
      await cleanupUploads(req.files);
      res.json({ success: false, error: mapError(err) });
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
