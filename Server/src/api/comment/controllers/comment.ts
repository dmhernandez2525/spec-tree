/**
 * comment controller
 *
 * TODO: SECURITY - Add server-side permission checks for comment operations
 *
 * Current implementation relies on client-side permission checks only.
 * The backend should enforce:
 *
 * 1. DELETE operations:
 *    - Only the comment author (authorId === ctx.state.user.id) can delete their own comment
 *
 * 2. UPDATE operations (resolve/reopen via status field):
 *    - Only the comment author OR users with admin/owner role in the organization
 *      can resolve or reopen a comment
 *
 * Implementation approach:
 * - Override the `delete` and `update` methods
 * - Fetch the comment first to check authorId
 * - For resolve/reopen, also check user's organization membership role
 * - Return 403 Forbidden if permission check fails
 *
 * Example implementation:
 * ```
 * async delete(ctx) {
 *   const { id } = ctx.params;
 *   const comment = await strapi.entityService.findOne('api::comment.comment', id);
 *   const userId = ctx.state.user?.id;
 *
 *   if (!comment || comment.authorId !== userId) {
 *     return ctx.forbidden('You can only delete your own comments');
 *   }
 *
 *   return super.delete(ctx);
 * }
 * ```
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment');
