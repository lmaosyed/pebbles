import multer from "multer";

// MEMORY STORAGE → file stored in RAM, not filesystem
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

export default upload;
