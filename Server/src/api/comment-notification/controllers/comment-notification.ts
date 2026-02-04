/**
 * comment-notification controller
 *
 * Server-side filtering to ensure users can only access their own notifications.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment-notification.comment-notification', ({ strapi }) => ({
  async find(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }

    // Force filter to only return notifications for the authenticated user
    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters || {}),
        user: { id: userId },
      },
    };

    return super.find(ctx);
  },

  async findOne(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }

    const { id } = ctx.params;
    const notification = await strapi.entityService.findOne(
      'api::comment-notification.comment-notification',
      id,
      { populate: ['user'] }
    );

    if (!notification) {
      return ctx.notFound('Notification not found');
    }

    if (notification.user?.id !== userId) {
      return ctx.forbidden('You can only access your own notifications');
    }

    return super.findOne(ctx);
  },

  async update(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }

    const { id } = ctx.params;
    const notification = await strapi.entityService.findOne(
      'api::comment-notification.comment-notification',
      id,
      { populate: ['user'] }
    );

    if (!notification) {
      return ctx.notFound('Notification not found');
    }

    if (notification.user?.id !== userId) {
      return ctx.forbidden('You can only update your own notifications');
    }

    return super.update(ctx);
  },
}));
