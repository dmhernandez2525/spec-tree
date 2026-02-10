import app from './app';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { registerCollaborationServer } from './collaboration/server';
import { logger } from './utils/logger';

dotenv.config();

const port = process.env.PORT || 3001;

const server = createServer(app);
registerCollaborationServer(server);

server.listen(port, () => {
  logger.info('microservice.start', `Server is running on port ${port}`);
});
