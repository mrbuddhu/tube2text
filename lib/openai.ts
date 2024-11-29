import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateArticle(transcript: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert content writer. Transform the following video transcript into a well-structured, engaging article. Include proper headings, paragraphs, and maintain the key points while improving readability."
        },
        {
          role: "user",
          content: transcript
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating article:', error);
    throw new Error('Failed to generate article');
  }
}

export async function generateSummary(transcript: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "Create a concise summary of the following video transcript, highlighting the main points and key takeaways."
        },
        {
          role: "user",
          content: transcript
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}

export async function extractKeywords(transcript: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "Extract the most important keywords and phrases from the following transcript. Return them as a comma-separated list."
        },
        {
          role: "user",
          content: transcript
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const keywords = completion.choices[0].message.content?.split(',').map(k => k.trim()) || [];
    return keywords;
  } catch (error) {
    console.error('Error extracting keywords:', error);
    throw new Error('Failed to extract keywords');
  }
}
