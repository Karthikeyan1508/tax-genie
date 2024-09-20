import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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

let pdfContent = ''; // This should be set with the PDF content from an earlier request

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
        }
      }
    );

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      return 'I am sorry, I received an unexpected response structure.';
    }
  } catch (error) {
    console.error('Error fetching response from Gemini LLM:', error);
    return 'I am sorry, I am having trouble responding right now.';
  }
};

// Serverless function to handle chat
export default async function handler(req, res) {
  const { chatId } = req.query;
  
  if (req.method === 'POST') {
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
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else if (req.method === 'GET') {
    // Retrieve messages for chatId
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      const messages = messagesSnapshot.docs.map(doc => ({
        text: doc.data().text,
        sender: doc.data().sender,
      }));

      res.status(200).json({ messages });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
