/**
 * version-snapshot controller
 *
 * Ensures snapshots are fetched with an app filter.
 */

import { factories } from '@strapi/strapi';

const VERSION_SNAPSHOT_UID = 'api::version-snapshot.version-snapshot' as never;

export default factories.createCoreController(
  VERSION_SNAPSHOT_UID,
  () => ({
    async find(ctx) {
      const rawFilters = ctx.query?.filters;
      const filters =
        rawFilters && typeof rawFilters === 'object'
          ? (rawFilters as Record<string, unknown>)
          : {};
      const rawAppFilter = filters.app;
      const appFilter =
        rawAppFilter && typeof rawAppFilter === 'object'
          ? (rawAppFilter as Record<string, unknown>)
          : {};
      const rawPopulate = ctx.query?.populate;
      const populate =
        rawPopulate && typeof rawPopulate === 'object'
          ? (rawPopulate as Record<string, unknown>)
          : {};

      if (!appFilter.documentId && !appFilter.id) {
        return ctx.badRequest('An app filter is required.');
      }

      ctx.query = {
        ...ctx.query,
        filters,
        populate: {
          ...populate,
          app: { fields: ['documentId'] },
          parentSnapshot: { fields: ['documentId'] },
        },
      };

      return super.find(ctx);
    },
  })
);
