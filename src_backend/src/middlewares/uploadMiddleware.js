import multer from 'multer';

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf'
];

function fileFilter(req, file, cb) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error('Tipo de archivo no permitido. Use imágenes o PDF.'),
      false
    );
  }

  cb(null, true);
}

export const uploadSingleFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}).single('file');