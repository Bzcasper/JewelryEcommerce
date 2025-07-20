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
  if (!algoliaIndex) {
    console.warn('Algolia search not configured');
    return { hits: [], nbHits: 0 };
  }

  try {
    const searchFilters: string[] = [];
    
    if (filters?.categories?.length) {
      searchFilters.push(`category:${filters.categories.join(' OR category:')}`);
    }
    
    if (filters?.brands?.length) {
      searchFilters.push(`brand:${filters.brands.join(' OR brand:')}`);
    }
    
    if (filters?.materials?.length) {
      searchFilters.push(`materials:${filters.materials.join(' OR materials:')}`);
    }
    
    if (filters?.priceRange) {
      searchFilters.push(`price:${filters.priceRange.min} TO ${filters.priceRange.max}`);
    }

    const results = await algoliaIndex.search(query, {
      filters: searchFilters.join(' AND '),
      hitsPerPage: 20,
      attributesToRetrieve: [
        'objectID',
        'title',
        'description',
        'price',
        'mainImageUrl',
        'category',
        'brand',
        'materials',
        'condition',
        'authenticated'
      ],
      attributesToHighlight: ['title', 'description', 'brand']
    });

    return results;
  } catch (error) {
    console.error('Algolia search error:', error);
    return { hits: [], nbHits: 0 };
  }
}

// Function to sync product to Algolia (for admin use)
export async function syncProductToAlgolia(product: any) {
  if (!algoliaIndex) {
    console.warn('Algolia indexing not configured');
    return;
  }

  try {
    await algoliaIndex.saveObject({
      objectID: product.id.toString(),
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      mainImageUrl: product.mainImageUrl,
      category: product.category?.name || '',
      brand: product.brand?.name || '',
      materials: product.productMaterials?.map((pm: any) => pm.material.name) || [],
      condition: product.condition,
      authenticated: product.authenticated,
      createdAt: product.createdAt
    });
  } catch (error) {
    console.error('Failed to sync product to Algolia:', error);
  }
}