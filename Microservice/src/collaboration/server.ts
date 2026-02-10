import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import type {
  CollaborationActivity,
  JoinPayload,
  ModePayload,
  MovePayload,
  PresenceUser,
  ReorderPayload,
  WorkItemAddPayload,
  WorkItemDeletePayload,
  WorkItemUpdatePayload,
} from './types';
import { logger } from '../utils/logger';

type RoomPresence = Map<string, PresenceUser>;
type RoomSockets = Map<string, Set<string>>;

const buildRoomId = (appId: string) => `collaboration:${appId}`;

const getAllowedOrigins = (): string[] => {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return ['http://localhost:3000'];
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
};

const presenceByRoom = new Map<string, RoomPresence>();
const socketsByRoom = new Map<string, RoomSockets>();
const socketRegistry = new Map<string, { roomId: string; userId: string }>();
const modeByRoom = new Map<string, ModePayload>();

const getRoomPresence = (roomId: string): RoomPresence => {
  const existing = presenceByRoom.get(roomId);
  if (existing) return existing;
  const next = new Map<string, PresenceUser>();
  presenceByRoom.set(roomId, next);
  return next;
};

const getRoomSockets = (roomId: string): RoomSockets => {
  const existing = socketsByRoom.get(roomId);
  if (existing) return existing;
  const next = new Map<string, Set<string>>();
  socketsByRoom.set(roomId, next);
  return next;
};

const updateUserSockets = (
  roomId: string,
  userId: string,
  socketId: string,
  action: 'add' | 'remove'
) => {
  const roomSockets = getRoomSockets(roomId);
  const userSockets = roomSockets.get(userId) ?? new Set<string>();

  if (action === 'add') {
    userSockets.add(socketId);
  } else {
    userSockets.delete(socketId);
  }

  if (userSockets.size === 0) {
    roomSockets.delete(userId);
  } else {
    roomSockets.set(userId, userSockets);
  }
};

const removePresenceIfNoSockets = (roomId: string, userId: string) => {
  const roomSockets = getRoomSockets(roomId);
  const userSockets = roomSockets.get(userId);
  if (!userSockets || userSockets.size === 0) {
    const roomPresence = getRoomPresence(roomId);
    roomPresence.delete(userId);
    return true;
  }
  return false;
};

export const registerCollaborationServer = (server: HttpServer) => {
  const io = new SocketServer(server, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('collaboration:join', (payload: JoinPayload) => {
      if (!payload?.appId || !payload.user?.id) {
        logger.warn('collaboration.join', 'Missing appId or user for collaboration join');
        return;
      }

      const roomId = buildRoomId(payload.appId);
      socket.join(roomId);
      socketRegistry.set(socket.id, { roomId, userId: payload.user.id });

      updateUserSockets(roomId, payload.user.id, socket.id, 'add');

      const roomPresence = getRoomPresence(roomId);
      const nextUser = {
        ...payload.user,
        lastActive: payload.user.lastActive || new Date().toISOString(),
      };
      roomPresence.set(payload.user.id, nextUser);

      socket.emit('collaboration:presence:sync', Array.from(roomPresence.values()));
      const modePayload = modeByRoom.get(roomId);
      if (modePayload) {
        socket.emit('collaboration:mode:update', modePayload);
      }
      socket.to(roomId).emit('collaboration:presence:update', nextUser);
    });

    socket.on('collaboration:presence:update', (user: PresenceUser) => {
      const registry = socketRegistry.get(socket.id);
      if (!registry || !user?.id) return;

      const roomPresence = getRoomPresence(registry.roomId);
      const updatedUser = {
        ...roomPresence.get(user.id),
        ...user,
        lastActive: user.lastActive || new Date().toISOString(),
      };
      roomPresence.set(user.id, updatedUser);

      socket.to(registry.roomId).emit('collaboration:presence:update', updatedUser);
    });

    socket.on('collaboration:activity', (activity: CollaborationActivity) => {
      const registry = socketRegistry.get(socket.id);
      if (!registry) return;
      socket.to(registry.roomId).emit('collaboration:activity', activity);
    });

    socket.on('collaboration:item:update', (payload: WorkItemUpdatePayload) => {
      const registry = socketRegistry.get(socket.id);
      if (!registry) return;
      socket.to(registry.roomId).emit('collaboration:item:update', payload);
    });

    socket.on('collaboration:item:add', (payload: WorkItemAddPayload) => {
      const registry = socketRegistry.get(socket.id);
      if (!registry) return;
      socket.to(registry.roomId).emit('collaboration:item:add', payload);
    });

    socket.on('collaboration:item:delete', (payload: WorkItemDeletePayload) => {
      const registry = socketRegistry.get(socket.id);
      if (!registry) return;
      socket.to(registry.roomId).emit('collaboration:item:delete', payload);
    });

    socket.on('collaboration:reorder', (payload: ReorderPayload) => {
      const registry = socketRegistry.get(socket.id);
      if (!registry) return;
      socket.to(registry.roomId).emit('collaboration:reorder', payload);
    });

    socket.on('collaboration:move', (payload: MovePayload) => {
      const registry = socketRegistry.get(socket.id);
      if (!registry) return;
      socket.to(registry.roomId).emit('collaboration:move', payload);
    });

    socket.on('collaboration:mode:update', (payload: ModePayload) => {
      const registry = socketRegistry.get(socket.id);
      if (!registry) return;
      modeByRoom.set(registry.roomId, payload);
      socket.to(registry.roomId).emit('collaboration:mode:update', payload);
    });

    socket.on('disconnect', () => {
      const registry = socketRegistry.get(socket.id);
      if (!registry) return;
      socketRegistry.delete(socket.id);

      updateUserSockets(registry.roomId, registry.userId, socket.id, 'remove');
      const removed = removePresenceIfNoSockets(registry.roomId, registry.userId);
      if (removed) {
        socket.to(registry.roomId).emit('collaboration:presence:remove', registry.userId);
      }
    });
  });

  return io;
};
