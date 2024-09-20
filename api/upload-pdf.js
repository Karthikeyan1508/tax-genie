import multer from 'multer';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import path from 'path';

// Set up multer for handling file uploads
const upload = multer({ dest: '/tmp/uploads/' });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('pdf')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to upload file' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      try {
        const dataBuffer = await fs.readFile(req.file.path);
        const data = await pdfParse(dataBuffer);
        
        // Store the PDF content globally for the session
        pdfContent = data.text;

        // Clean up the uploaded file
        await fs.unlink(req.file.path);

        res.status(200).json({ message: 'PDF uploaded and processed successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Error processing PDF', details: error.message });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
