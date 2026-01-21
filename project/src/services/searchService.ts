import { Platform } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Sends a product URL to the backend API for analysis
 * The backend will trigger n8n workflows
 */
export async function sendSearchToN8n(productUrl: string, platforms: Platform[]): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies/sessions
      body: JSON.stringify({
        productUrl,
        platforms: platforms.map(p => p.toUpperCase()),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start search');
    }

    const data = await response.json();
    return data.searchId;
  } catch (error: any) {
    console.error('Error starting search:', error);
    throw error;
  }
}
