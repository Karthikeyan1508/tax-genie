import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "tax-genie-f1840.firebaseapp.com",
  projectId: "tax-genie-f1840",
  storageBucket: "tax-genie-f1840.appspot.com",
  messagingSenderId: "370816786830",
  appId: "1:370816786830:web:c17d7ccdf713f6406f84df",
  measurementId: "G-J6YZ72F1FC"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Set up multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from 'public' directory
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

let pdfContent = ''; // Variable to store the parsed PDF content

// Function to get bot response from Gemini LLM
const getResponseFromGemini = async (userMessage) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Context: ${pdfContent}\n\nUser: ${userMessage}\n\nAssistant: Based on the provided context, here's my response:`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
          stopSequences: []
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }
    );

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected response structure:', response.data);
      return 'I am sorry, I received an unexpected response structure.';
    }
  } catch (error) {
    console.error('Error fetching response from Gemini LLM:', error.response ? error.response.data : error.message);
    return 'I am sorry, I am having trouble responding right now.';
  }
};

// API route to handle PDF uploads
app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  try {
    const dataBuffer = await fs.readFile(req.file.path);
    const data = await pdfParse(dataBuffer);
    pdfContent = data.text;

    // Clean up the uploaded file
    await fs.unlink(req.file.path);

    res.status(200).json({ message: 'PDF uploaded and processed successfully' });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Error processing PDF' });
  }
});

// API route to handle chat messages
app.post('/chat/:chatId', async (req, res) => {
  const chatId = req.params.chatId;
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content is missing' });
  }

  try {
    // Save user message to Firestore
    await addDoc(collection(db, 'messages'), {
      text: message,
      sender: 'user',
      chatId,
      timestamp: new Date(),
    });

    // Get bot response from Gemini LLM
    const botReply = await getResponseFromGemini(message);

    // Save bot reply to Firestore
    await addDoc(collection(db, 'messages'), {
      text: botReply,
      sender: 'bot',
      chatId,
      timestamp: new Date(),
    });

    res.status(200).json({ reply: botReply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// API route to retrieve chat messages
app.get('/chat/:chatId', async (req, res) => {
  const chatId = req.params.chatId;

  try {
    // Fetch messages for the chatId
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);

    if (messagesSnapshot.empty) {
      return res.status(200).json({ messages: [] });
    }

    const messages = messagesSnapshot.docs.map(doc => ({
      text: doc.data().text,
      sender: doc.data().sender,
    }));

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Serve 'index.html' for the root path ('/')
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Serve 'chat.html' for any '/chat/*' routes
app.get('/chat?*', (req, res) => {
  res.sendFile(path.join(publicPath, 'chat.html'));
});
app.get('/feedback', (req, res) => {
  res.sendFile(path.join(publicPath, 'feedback.html'));
});
// Catch-all route ('*') to serve 'index.html' for any other undefined paths
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
