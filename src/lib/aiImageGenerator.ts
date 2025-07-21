export async function generateBookCover(prompt: string): Promise<string> {
  // Since external AI APIs may be blocked or unreliable, use local fallback images
  // Create a deterministic fallback based on the prompt content
  console.log("Using fallback image for prompt:", prompt);
  
  // Use different Unsplash images based on book genre/content
  const fallbackImages = [
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', // Classic books
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80', // Adventure
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', // Romance/Classic
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', // Mystery
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80', // Modern/Tech
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80'  // Modern/Creative
  ];
  
  // Simple hash function to pick a consistent image for a given prompt
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % fallbackImages.length;
  return fallbackImages[index];
} 