// Algolia search functionality (temporarily disabled due to import issues)
// Will use regular search API instead

export const searchClient = null;
export const algoliaIndex = null;

// Search function
export async function searchProducts(query: string, filters?: {
  categories?: string[];
  brands?: string[];
  priceRange?: { min: number; max: number };
  materials?: string[];
}) {
  console.warn('Algolia search not configured');
  return { hits: [], nbHits: 0 };
}

// Function to sync product to Algolia (for admin use)
export async function syncProductToAlgolia(product: any) {
  console.warn('Algolia indexing not configured');
  return;
}