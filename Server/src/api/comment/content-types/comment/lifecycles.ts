import type { Core } from '@strapi/strapi';

type CommentLifecycleResult = {
  documentId: string;
  authorId?: string | null;
  authorName?: string | null;
  body?: string | null;
  mentions?: string[] | null;
};

type UserRecord = {
  id: number;
  documentId: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
};

const normalizeMentions = (mentions?: string[] | null): string[] => {
  if (!mentions) return [];
  return mentions.filter((value) => typeof value === 'string' && value.trim().length > 0);
};

const buildUserLabel = (user: UserRecord) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return fullName || user.username || user.email || 'SpecTree User';
};

const resolveUserByIdentifier = async (
  strapi: Core.Strapi,
  identifier: string
): Promise<UserRecord | null> => {
  const query = strapi.db.query('plugin::users-permissions.user');
  const userByDocument = await query.findOne({ where: { documentId: identifier } });
  if (userByDocument) {
    return userByDocument as UserRecord;
  }

  const numericId = Number(identifier);
  if (!Number.isNaN(numericId)) {
    const userById = await query.findOne({ where: { id: numericId } });
    return userById ? (userById as UserRecord) : null;
  }

  return null;
};

export default {
  async afterCreate(event: { result: CommentLifecycleResult; strapi: Core.Strapi }) {
    const { result, strapi } = event;
    const mentions = normalizeMentions(result.mentions);
    if (mentions.length === 0) return;

    const uniqueMentions = Array.from(new Set(mentions));
    const authorId = result.authorId || null;

    for (const mentionId of uniqueMentions) {
      if (authorId && mentionId === authorId) {
        continue;
      }

      const user = await resolveUserByIdentifier(strapi, mentionId);
      if (!user) continue;

      const notificationBase = {
        comment: {
          connect: [result.documentId],
        },
        user: {
          connect: [user.documentId],
        },
      };

      await strapi.documents('api::comment-notification.comment-notification').create({
        data: {
          ...notificationBase,
          channel: 'in_app',
          status: 'unread',
        },
      });

      const emailNotification = await strapi
        .documents('api::comment-notification.comment-notification')
        .create({
          data: {
            ...notificationBase,
            channel: 'email',
            status: 'queued',
          },
        });

      if (!user.email) {
        await strapi
          .documents('api::comment-notification.comment-notification')
          .update({
            documentId: emailNotification.documentId,
            data: { status: 'failed' },
          });
        continue;
      }

      try {
        await strapi.plugins['email'].services.email.send({
          to: user.email,
          subject: `SpecTree comment mention from ${result.authorName || 'a teammate'}`,
          text: `${buildUserLabel(user)}, you were mentioned in a comment: ${result.body || ''}`,
        });
        await strapi
          .documents('api::comment-notification.comment-notification')
          .update({
            documentId: emailNotification.documentId,
            data: { status: 'sent', sentAt: new Date().toISOString() },
          });
      } catch (error) {
        strapi.log.error('Failed to send comment notification email', error as Error);
        await strapi
          .documents('api::comment-notification.comment-notification')
          .update({
            documentId: emailNotification.documentId,
            data: { status: 'failed' },
          });
      }
    }
  },
};
