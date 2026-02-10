/**
 * version-snapshot controller
 *
 * Ensures snapshots are fetched with an app filter.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::version-snapshot.version-snapshot',
  () => ({
    async find(ctx) {
      const filters = (ctx.query?.filters || {}) as Record<string, unknown>;
      const appFilter = (filters.app || {}) as Record<string, unknown>;

      if (!appFilter.documentId && !appFilter.id) {
        return ctx.badRequest('An app filter is required.');
      }

      ctx.query = {
        ...ctx.query,
        filters,
        populate: {
          ...(ctx.query?.populate || {}),
          app: { fields: ['documentId'] },
        },
      };

      return super.find(ctx);
    },
  })
);
