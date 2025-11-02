import { ProgressUpdate } from '../types';

// These are loaded from CDNs in index.html, so we declare them as globals for TypeScript
declare const pdfjsLib: any;
declare const window: any; // To access window.GoogleGenAI

const API_KEY = process.env.API_KEY;

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

async function transcribeImageWithGemini(base64Image: string, mimeType: string): Promise<string> {
  if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  if (!window.GoogleGenAI) {
    throw new Error("GoogleGenAI library not loaded. Please check your internet connection and script tags.");
  }

  const ai = new window.GoogleGenAI({ apiKey: API_KEY });

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  const textPart = {
    text: "Transcribe all text from this image accurately. Preserve the original line breaks and formatting as much as possible. If there is no text, return an empty response."
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
  } catch(error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a response from the AI model. Please check your API key and network connection.");
  }
}

export const transcribePdf = async (
  file: File,
  onProgress: (update: ProgressUpdate) => void,
  options?: { pagesToProcess?: number[] }
): Promise<string> => {
  onProgress({ page: 0, total: 0, message: 'Reading PDF file...' });
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  const pagesToProcess = options?.pagesToProcess ?? Array.from({ length: numPages }, (_, i) => i + 1);
  const totalPagesToProcess = pagesToProcess.length;

  if (totalPagesToProcess === 0) {
    return "No pages were selected for transcription.";
  }
  
  onProgress({ page: 0, total: totalPagesToProcess, message: `Found ${totalPagesToProcess} pages to process.` });

  for (const [index, pageNum] of pagesToProcess.entries()) {
    const currentPageInProcess = index + 1;
    onProgress({ page: currentPageInProcess, total: totalPagesToProcess, message: `Processing page ${pageNum} of ${numPages}...` });
    
    // page numbers are 1-based, getPage expects 1-based index
    const page = await pdf.getPage(pageNum);
    
    // Render page to canvas to convert to an image
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR quality
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) {
      throw new Error("Could not create canvas context.");
    }

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // Convert canvas to base64 image
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller size
    const base64Image = imageDataUrl.split(',')[1];
    
    onProgress({ page: currentPageInProcess, total: totalPagesToProcess, message: `Analyzing image from page ${pageNum}...` });
    
    const textFromPage = await transcribeImageWithGemini(base64Image, 'image/jpeg');

    if (textFromPage) {
        fullText += `--- Page ${pageNum} ---\n\n${textFromPage}\n\n`;
    }
     page.cleanup(); // Clean up page resources to save memory
  }

  return fullText.trim();
};