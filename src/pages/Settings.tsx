import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { summarizeLibrary, recommendBook } from '@/lib/openai';

const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('openaiApiKey');
    if (stored) setApiKey(stored);
  }, []);

  const saveKey = () => {
    localStorage.setItem('openaiApiKey', apiKey);
  };

  const handleSummarize = async () => {
    try {
      const summary = await summarizeLibrary(apiKey);
      setResponse(summary);
    } catch (err) {
      setResponse('Failed to get summary');
      console.error(err);
    }
  };

  const handleRecommend = async () => {
    try {
      const rec = await recommendBook(apiKey);
      setResponse(rec);
    } catch (err) {
      setResponse('Failed to get recommendation');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium">OpenAI API Key</label>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
        />
        <Button onClick={saveKey}>Save Key</Button>
      </div>
      <div className="flex gap-4 pt-4">
        <Button onClick={handleSummarize}>Summarize Library</Button>
        <Button variant="outline" onClick={handleRecommend}>
          Recommend Book
        </Button>
      </div>
      {response && (
        <pre className="mt-4 whitespace-pre-wrap p-4 border rounded-md bg-muted/20">
          {response}
        </pre>
      )}
    </div>
  );
};

export default SettingsPage;
