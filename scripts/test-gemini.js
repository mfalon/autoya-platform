const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key found in env!');
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    'text-embedding-04', // maybe this name?
    'text-embedding-004',
    'gemini-embedding-001',
    'gemini-embedding-2'
  ];
  
  for (const m of modelsToTest) {
    try {
      console.log(`Testing embedding model: ${m} with outputDimensionality: 768...`);
      const model = genAI.getGenerativeModel({ model: m });
      // In JS SDK, outputDimensionality can be passed to embedContent as TaskType config or options
      const result = await model.embedContent({
        content: { parts: [{ text: 'Hola mundo' }] },
        outputDimensionality: 768
      });
      console.log(`Success with ${m}! Vector length:`, result.embedding.values.length);
    } catch (err) {
      console.log(`Failed with ${m}:`, err.message || err);
    }
  }
}

main().catch(console.error);
