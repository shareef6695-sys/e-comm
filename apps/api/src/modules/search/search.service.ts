import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SearchService implements OnModuleInit {
  private client: Client;
  private readonly logger = new Logger(SearchService.name);

  constructor(private configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get<string>('OPENSEARCH_NODE') || 'http://localhost:9200',
    });
  }

  async onModuleInit() {
    try {
      // Create indices if they don't exist
      const productIndexExists = await this.client.indices.exists({ index: 'products' });
      if (!productIndexExists.body) {
        await this.client.indices.create({
          index: 'products',
          body: {
            mappings: {
              properties: {
                tenantId: { type: 'keyword' },
                name: { type: 'text' },
                description: { type: 'text' },
                category: { type: 'keyword' },
                price: { type: 'float' },
                attributes: { type: 'nested' }, // Facets like color, size
                tags: { type: 'keyword' },
                createdAt: { type: 'date' },
              },
            },
          },
        });
        this.logger.log('Created products index');
      }

      const supplierIndexExists = await this.client.indices.exists({ index: 'suppliers' });
      if (!supplierIndexExists.body) {
        await this.client.indices.create({
          index: 'suppliers',
          body: {
            mappings: {
              properties: {
                name: { type: 'text' },
                description: { type: 'text' },
                categories: { type: 'keyword' },
                location: { type: 'geo_point' }, // Future use
                rating: { type: 'float' },
              },
            },
          },
        });
        this.logger.log('Created suppliers index');
      }
    } catch (error) {
      this.logger.error('Failed to initialize OpenSearch indices', error);
    }
  }

  // --- Product Operations ---

  async indexProduct(tenantId: string, product: any) {
    return this.client.index({
      index: 'products',
      id: product.id,
      body: {
        tenantId,
        name: product.name,
        description: product.description,
        price: product.basePrice,
        category: product.category?.name, // Flattened for search
        tags: product.tags,
        attributes: product.attributes, // Should be array of { key, value }
        createdAt: product.createdAt,
      },
      refresh: true,
    });
  }

  async deleteProduct(productId: string) {
    return this.client.delete({
      index: 'products',
      id: productId,
      refresh: true,
    });
  }

  async searchProducts(tenantId: string, query: string, filters: any = {}, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const must: any[] = [{ term: { tenantId } }];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name^3', 'description', 'tags'],
          fuzziness: 'AUTO',
        },
      });
    }

    // Apply Filters (Facets)
    if (filters.minPrice || filters.maxPrice) {
      must.push({
        range: {
          price: {
            gte: filters.minPrice || 0,
            lte: filters.maxPrice || Infinity,
          },
        },
      });
    }

    if (filters.category) {
      must.push({ term: { category: filters.category } });
    }

    // Example attribute filter: ?color=red
    // Assumes attributes are nested or simple objects. Simple keyword approach here.
    // For nested:
    // if (filters.attributes) ...

    const result = await this.client.search({
      index: 'products',
      body: {
        from,
        size: limit,
        query: {
          bool: { must },
        },
        aggs: {
          categories: {
            terms: { field: 'category' },
          },
          price_range: {
            stats: { field: 'price' },
          },
        },
      },
    });

    return {
      hits: result.body.hits.hits.map((hit: any) => ({ id: hit._id, ...hit._source })),
      total: (result.body.hits.total as any).value ?? result.body.hits.total,
      facets: result.body.aggregations,
    };
  }

  // --- Supplier (Tenant) Operations ---

  async indexSupplier(supplier: any) {
    return this.client.index({
      index: 'suppliers',
      id: supplier.id,
      body: {
        name: supplier.name,
        description: supplier.description,
        categories: supplier.categories, // Array of strings
        // location: ...
      },
      refresh: true,
    });
  }

  async searchSuppliers(query: string, filters: any = {}, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const must: any[] = [];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name^3', 'description'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (filters.category) {
        must.push({ term: { categories: filters.category } });
    }

    const result = await this.client.search({
      index: 'suppliers',
      body: {
        from,
        size: limit,
        query: {
          bool: { must: must.length > 0 ? must : [{ match_all: {} }] },
        },
        aggs: {
            categories: {
                terms: { field: 'categories' }
            }
        }
      },
    });

    return {
      hits: result.body.hits.hits.map((hit: any) => ({ id: hit._id, ...hit._source })),
      total: (result.body.hits.total as any).value ?? result.body.hits.total,
      facets: result.body.aggregations,
    };
  }
}
