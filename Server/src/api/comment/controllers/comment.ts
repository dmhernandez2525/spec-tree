/**
 * comment controller
 *
 * Server-side authorization for comment operations:
 * - DELETE: Only the comment author can delete their own comment
 * - UPDATE (resolve/reopen): Author or organization admin/owner
 * - CREATE: authorId must match authenticated user
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }

    const { data } = ctx.request.body;
    if (data?.authorId && String(data.authorId) !== String(userId)) {
      return ctx.forbidden('Cannot create comments on behalf of another user');
    }

    return super.create(ctx);
  },

  async update(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }

    const { id } = ctx.params;
    const comment = await strapi.entityService.findOne('api::comment.comment', id, {
      populate: ['app', 'app.organization'],
    });

    if (!comment) {
      return ctx.notFound('Comment not found');
    }

    const isAuthor = String(comment.authorId) === String(userId);
    const organization = comment.app?.organization;
    const isOrgOwner = organization && String(organization.ownerId) === String(userId);

    if (!isAuthor && !isOrgOwner) {
      return ctx.forbidden('You can only update your own comments or comments in your organization');
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }

    const { id } = ctx.params;
    const comment = await strapi.entityService.findOne('api::comment.comment', id);

    if (!comment) {
      return ctx.notFound('Comment not found');
    }

    if (String(comment.authorId) !== String(userId)) {
      return ctx.forbidden('You can only delete your own comments');
    }

    return super.delete(ctx);
  },
}));
