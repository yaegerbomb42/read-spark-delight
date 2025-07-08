export async function generateBookCover(prompt: string): Promise<string> {
  // Using a public Hugging Face Space for Stable Diffusion (OpenJourney v4)
  // Note: These public APIs can be slow, rate-limited, or unstable. 
  // For production, you'd host your own or use a paid service.
  const API_URL = "https://api-inference.huggingface.co/models/prompthero/openjourney-v4";
  const API_TOKEN = import.meta.env.VITE_HF_API_KEY; // Optional: If you have a Hugging Face API key for higher rate limits

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (API_TOKEN) {
    headers["Authorization"] = `Bearer ${API_TOKEN}`;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Image Generation API error:", response.status, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const imageBlob = await response.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    console.log("Generated image URL:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    // Fallback to a nice Unsplash placeholder if AI generation fails
    return 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80';
  }
} 