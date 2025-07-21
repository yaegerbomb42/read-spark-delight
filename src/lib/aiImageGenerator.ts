export async function generateBookCover(prompt: string): Promise<string> {
  // Use curated Unsplash images with better genre matching
  console.log("Generating cover for prompt:", prompt);
  
  const promptLower = prompt.toLowerCase();
  
  // Genre-specific image collections
  const genreImages = {
    classic: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', // Old books
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', // Classic literature
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80', // Vintage books
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', // Library setting
    ],
    technology: [
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80', // Modern tech
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80', // Digital creative
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', // Computer code
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=400&q=80', // Digital interface
    ],
    wellness: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80', // Zen/meditation
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80', // Mindfulness
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=400&q=80', // Nature/wellness
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=400&q=80', // Peaceful reading
    ],
    storytelling: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80', // Open book
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80', // Writing/storytelling
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80', // Typewriter/writing
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80', // Creative writing
    ],
    mystery: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', // Dark library
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80', // Old books
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', // Vintage mystery
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', // Classic detective
    ],
    adventure: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80', // Adventure books
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', // Classic adventure
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', // Epic tales
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', // Journey books
    ]
  };
  
  // Determine genre from prompt
  let selectedGenre = 'classic'; // default
  
  if (promptLower.includes('digital') || promptLower.includes('technology') || promptLower.includes('computer') || promptLower.includes('tech')) {
    selectedGenre = 'technology';
  } else if (promptLower.includes('wellness') || promptLower.includes('mindful') || promptLower.includes('meditation') || promptLower.includes('zen')) {
    selectedGenre = 'wellness';
  } else if (promptLower.includes('story') || promptLower.includes('narrative') || promptLower.includes('writing') || promptLower.includes('creative')) {
    selectedGenre = 'storytelling';
  } else if (promptLower.includes('sherlock') || promptLower.includes('mystery') || promptLower.includes('detective') || promptLower.includes('crime')) {
    selectedGenre = 'mystery';
  } else if (promptLower.includes('adventure') || promptLower.includes('journey') || promptLower.includes('quest') || promptLower.includes('moby')) {
    selectedGenre = 'adventure';
  }
  
  console.log("Selected genre:", selectedGenre, "for prompt:", prompt);
  
  // Simple hash function to pick a consistent image for a given prompt
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const images = genreImages[selectedGenre as keyof typeof genreImages];
  const index = Math.abs(hash) % images.length;
  return images[index];
} 