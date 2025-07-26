export function chunkText(text: string, maxLength = 1000): string[] {
  const paragraphs = text.split(/\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxLength) {
      chunks.push(currentChunk);
      currentChunk = para;
    } else {
      currentChunk += "\n" + para;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
