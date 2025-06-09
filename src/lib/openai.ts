export async function callOpenAI(apiKey: string, messages: any[]): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

export async function summarizeLibrary(apiKey: string): Promise<string> {
  const stored = localStorage.getItem('myBooks');
  const books = stored ? JSON.parse(stored) : [];
  const summaryData = books.map((b: any) => ({
    title: b.title,
    progress: b.progress,
    currentPage: b.currentPage,
    totalPages: b.totalPages,
    readTimeMinutes: b.readTimeMinutes,
  }));
  const messages = [
    {
      role: 'system',
      content: 'You help readers recall what they have read.',
    },
    {
      role: 'user',
      content: `Here is my library as JSON: ${JSON.stringify(summaryData)}. Summarize my progress so I can quickly catch up.`,
    },
  ];
  return callOpenAI(apiKey, messages);
}

export async function recommendBook(apiKey: string): Promise<string> {
  const stored = localStorage.getItem('myBooks');
  const books = stored ? JSON.parse(stored) : [];
  const titles = books.map((b: any) => b.title).join(', ');
  const messages = [
    {
      role: 'system',
      content: 'You recommend new books based on the user\'s library.',
    },
    {
      role: 'user',
      content: `My current books are: ${titles}. Suggest a new book I might enjoy and explain why.`,
    },
  ];
  return callOpenAI(apiKey, messages);
}
