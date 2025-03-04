import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  constructor() {
    // Ensure API key is correctly set
    const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("Gemini API key is missing. Please set REACT_APP_GEMINI_API_KEY in .env file.");
    }
    this.genAI = new GoogleGenerativeAI(API_KEY);
  }

  // Detect file type and set appropriate MIME type
  _detectMimeType(fileBase64) {
    const base64Prefix = fileBase64.split(',')[0];
    const mimeTypeMap = {
      'data:image/jpeg': 'image/jpeg',
      'data:image/png': 'image/png',
      'data:image/gif': 'image/gif',
      'data:image/webp': 'image/webp',
      'data:application/pdf': 'application/pdf'
    };

    return mimeTypeMap[base64Prefix] || 'application/octet-stream';
  }

  // Text-based query
  async generateAnswer(question) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: "models/gemini-2.0-flash"
      });
      
      const result = await model.generateContent(question);
      const response = result.response;
      const text = response.text();
      
      return {
        success: true,
        answer: text
      };
    } catch (error) {
      console.error("Detailed Gemini API Error:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });

      return {
        success: false,
        error: this._formatErrorMessage(error),
        fullError: error
      };
    }
  }

  // File-based query with image/document support
  async generateAnswerWithFile(question, fileBase64) {
    try {
      // Validate inputs
      if (!fileBase64) {
        throw new Error("No file provided");
      }

      // Detect MIME type and extract base64 data
      const mimeType = this._detectMimeType(fileBase64);
      const base64Data = fileBase64.split(',')[1];

      // Select appropriate model based on file type
      const modelName = this._selectModelForFileType(mimeType);
      const model = this.genAI.getGenerativeModel({ model: modelName });

      // Prepare content for analysis
      const result = await model.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [
            { text: question || "Describe this image/document" },
            { 
              inlineData: { 
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }]
      });

      const response = result.response;
      const text = response.text();
      
      return {
        success: true,
        answer: text,
        fileType: mimeType
      };
    } catch (error) {
      console.error("File Analysis Error:", error);
      return {
        success: false,
        error: this._formatErrorMessage(error),
        fileType: this._detectMimeType(fileBase64)
      };
    }
  }

  // Select model based on file type
  _selectModelForFileType(mimeType) {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    return imageTypes.includes(mimeType) 
      ? "models/gemini-1.0-pro-vision" 
      : "models/gemini-2.0-flash";
  }

  // Provide user-friendly error messages
  _formatErrorMessage(error) {
    const errorMap = {
      'API key': "Invalid or missing API key",
      'network': "Network error. Check your connection",
      'quota': "API usage quota exceeded",
      'rate limit': "Too many requests. Please wait",
      'invalid': "Invalid request parameters"
    };

    for (const [key, message] of Object.entries(errorMap)) {
      if (error.message.toLowerCase().includes(key)) {
        return message;
      }
    }

    return error.message || "An unexpected error occurred";
  }

  // Optional: Method to list available models
  async listAvailableModels() {
    try {
      const availableModels = await this.genAI.listModels();
      console.log("Available Models:", availableModels);
      return availableModels;
    } catch (error) {
      console.error("Error listing models:", error);
      return null;
    }
  }
}

export default new GeminiService();