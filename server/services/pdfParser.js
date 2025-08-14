import fs from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function parsePdfPages(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await getDocument({ data }).promise;

  const parsedPages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const strings = content.items.map(item => item.str);
    
    // --- NO SANITIZATION APPLIED ---
    // The text is joined and whitespace is handled, but no characters are filtered
    const text = strings.join(' ').replace(/\s+/g, ' ').trim();
    // --------------------------------

    const charCount = text.length;
    const needsOCR = charCount < 50;

    parsedPages.push({
      page: i,
      method: 'text',
      content: text,
      charCount,
      needsOCR
    });
  }

  return parsedPages;
}