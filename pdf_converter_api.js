/**
 * PDF Converter & Merger API Server
 * Express.js backend with multer for file uploads
 * Routes for conversion and merging operations
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const cors = require('cors');
const uuid = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', req.sessionId);
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'text/plain'
    ];
    
    const allowedExtensions = ['.pdf', '.docx', '.md', '.txt'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not supported: ${file.originalname}`));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Session middleware
app.use((req, res, next) => {
  if (!req.sessionId) {
    req.sessionId = uuid.v4();
  }
  next();
});

// Routes

/**
 * POST /upload
 * Upload files for conversion/merging
 */
app.post('/upload', upload.array('files', 20), (req, res) => {
  try {
    const files = req.files.map(file => ({
      id: uuid.v4(),
      originalName: file.originalname,
      savedName: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));
    
    res.json({
      success: true,
      files,
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /convert
 * Convert uploaded files to a different format
 * Body: { files: [filePaths], outputFormat: 'pdf'|'docx'|'md', options: {...} }
 */
app.post('/convert', async (req, res) => {
  try {
    const { files, outputFormat, options } = req.body;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }
    
    const outputDir = path.join(__dirname, 'outputs', req.sessionId);
    await fs.mkdir(outputDir, { recursive: true });
    
    const results = [];
    
    for (const file of files) {
      const outputFileName = `${path.parse(file).name}_converted.${getExtension(outputFormat)}`;
      const outputPath = path.join(outputDir, outputFileName);
      
      // Call Python conversion script
      const success = await convertFile(
        file,
        outputPath,
        outputFormat,
        options
      );
      
      if (success) {
        results.push({
          originalFile: path.basename(file),
          outputFile: outputFileName,
          outputPath: `/download/${req.sessionId}/${outputFileName}`,
          success: true
        });
      } else {
        results.push({
          originalFile: path.basename(file),
          success: false,
          error: 'Conversion failed'
        });
      }
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /merge
 * Merge multiple uploaded files
 * Body: { files: [filePaths], outputFormat: 'pdf'|'docx', options: {...} }
 */
app.post('/merge', async (req, res) => {
  try {
    const { files, outputFormat, options } = req.body;
    
    if (!files || files.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 files are required to merge'
      });
    }
    
    const outputDir = path.join(__dirname, 'outputs', req.sessionId);
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = Date.now();
    const outputFileName = `merged_${timestamp}.${getExtension(outputFormat)}`;
    const outputPath = path.join(outputDir, outputFileName);
    
    // Call Python merge script
    const success = await mergeFiles(files, outputPath, outputFormat, options);
    
    if (success) {
      res.json({
        success: true,
        outputFile: outputFileName,
        outputPath: `/download/${req.sessionId}/${outputFileName}`
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Merge operation failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /download/:sessionId/:filename
 * Download converted/merged file
 */
app.get('/download/:sessionId/:filename', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'outputs', req.params.sessionId, req.params.filename);
    
    // Security check: ensure file is within the outputs directory
    const resolvedPath = path.resolve(filePath);
    const outputsDir = path.resolve(path.join(__dirname, 'outputs'));
    
    if (!resolvedPath.startsWith(outputsDir)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }
});

/**
 * POST /cleanup
 * Clean up session files
 */
app.post('/cleanup', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads', req.sessionId);
    const outputsDir = path.join(__dirname, 'outputs', req.sessionId);
    
    await fs.rm(uploadsDir, { recursive: true, force: true });
    await fs.rm(outputsDir, { recursive: true, force: true });
    
    res.json({
      success: true,
      message: 'Session cleaned up'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions

/**
 * Get file extension based on format
 */
function getExtension(format) {
  const extensions = {
    'pdf': 'pdf',
    'docx': 'docx',
    'md': 'md'
  };
  return extensions[format] || format;
}

/**
 * Convert a file using Python backend
 */
function convertFile(inputPath, outputPath, outputFormat, options) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'pdf_converter_backend.py');
    
    const args = [
      `"${pythonScript}"`,
      '--input', `"${inputPath}"`,
      '--output', `"${outputPath}"`,
      '--format', outputFormat,
      '--theme', options?.theme || 'light',
      '--add-header', options?.addHeader ? '1' : '0',
      '--header-text', `"${options?.headerText || 'Document'}"`,
      '--font-size', options?.fontSize || '12',
      '--margins', options?.margins || '1'
    ];
    
    const pythonCmd = process.env.PYTHON_PATH || 'python';
    const python = spawn(pythonCmd, args, { shell: true });
    let output = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        console.error('Python error:', error);
        reject(error);
      }
    });
  });
}

/**
 * Merge files using Python backend
 */
function mergeFiles(inputPaths, outputPath, outputFormat, options) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'pdf_converter_backend.py');
    
    const args = [
      `"${pythonScript}"`,
      '--merge',
      '--inputs', `"${inputPaths.join(',')}"`,
      '--output', `"${outputPath}"`,
      '--format', outputFormat,
      '--theme', options?.theme || 'light',
      '--pages-per-sheet', options?.pagesPerSheet || '1'
    ];
    
    const pythonCmd = process.env.PYTHON_PATH || 'python';
    const python = spawn(pythonCmd, args, { shell: true });
    let output = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        console.error('Python error:', error);
        reject(error);
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`📄 PDF Converter API listening on http://localhost:${PORT}`);
  console.log('✨ Ready to convert and merge documents!');
});

module.exports = app;
