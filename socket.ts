import {io} from './app'
export const getIO = () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
export default getIO;