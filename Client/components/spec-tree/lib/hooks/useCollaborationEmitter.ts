import { useMemo } from 'react';
import { getCollaborationEmitter } from '../collaboration/collaboration-emitter';

const useCollaborationEmitter = () => {
  return useMemo(() => getCollaborationEmitter(), []);
};

export default useCollaborationEmitter;
