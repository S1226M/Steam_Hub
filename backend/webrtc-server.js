import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

class WebRTCServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.rooms = new Map(); // Store active rooms
    this.peerConnections = new Map(); // Store peer connections
    
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 WebRTC Client connected: ${socket.id}`);

      // Join a streaming room
      socket.on('join-room', async (roomId, userId, isBroadcaster) => {
        console.log(`👥 User ${userId} joining room ${roomId} as ${isBroadcaster ? 'broadcaster' : 'viewer'}`);
        
        socket.join(roomId);
        
        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, {
            broadcaster: null,
            viewers: new Set(),
            peerConnections: new Map()
          });
        }
        
        const room = this.rooms.get(roomId);
        
        if (isBroadcaster) {
          room.broadcaster = socket.id;
          socket.emit('room-joined', { roomId, role: 'broadcaster' });
        } else {
          room.viewers.add(socket.id);
          socket.emit('room-joined', { roomId, role: 'viewer' });
          
          // Notify broadcaster about new viewer
          if (room.broadcaster) {
            this.io.to(room.broadcaster).emit('viewer-joined', { viewerId: socket.id });
          }
        }
      });

      // Handle WebRTC offer from broadcaster
      socket.on('offer', async (data) => {
        const { roomId, offer, targetId } = data;
        console.log(`📤 Offer from ${socket.id} to ${targetId} in room ${roomId}`);
        
        // Forward the offer to the target viewer
        this.io.to(targetId).emit('offer', {
          offer: offer,
          from: socket.id,
          roomId: roomId
        });
      });

      // Handle WebRTC answer from viewer
      socket.on('answer', async (data) => {
        const { answer, from } = data;
        console.log(`📥 Answer from ${socket.id} to ${from}`);
        
        // Forward the answer to the broadcaster
        this.io.to(from).emit('answer', {
          answer: answer,
          from: socket.id
        });
      });

      // Handle ICE candidates
      socket.on('ice-candidate', (data) => {
        const { candidate, targetId } = data;
        console.log(`🧊 ICE candidate from ${socket.id} to ${targetId}`);
        
        // Forward ICE candidate to the target peer
        this.io.to(targetId).emit('ice-candidate', {
          candidate: candidate,
          from: socket.id
        });
      });

      // Handle viewer request for stream
      socket.on('request-stream', (data) => {
        const { roomId } = data;
        const room = this.rooms.get(roomId);
        
        if (room && room.broadcaster) {
          this.io.to(room.broadcaster).emit('viewer-request-stream', {
            viewerId: socket.id
          });
        }
      });

      // Handle stream start/stop
      socket.on('stream-started', (data) => {
        const { roomId } = data;
        console.log(`🎬 Stream started in room ${roomId}`);
        this.io.to(roomId).emit('broadcaster-started-stream');
      });

      socket.on('stream-stopped', (data) => {
        const { roomId } = data;
        console.log(`⏹️ Stream stopped in room ${roomId}`);
        this.io.to(roomId).emit('broadcaster-stopped-stream');
      });

      // Handle chat messages
      socket.on('chat-message', (data) => {
        const { roomId, message, userId, username } = data;
        console.log(`💬 Chat message in room ${roomId}: ${username}: ${message}`);
        this.io.to(roomId).emit('chat-message', {
          message,
          userId,
          username,
          timestamp: new Date()
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 WebRTC Client disconnected: ${socket.id}`);
        
        // Clean up rooms
        for (const [roomId, room] of this.rooms.entries()) {
          if (room.broadcaster === socket.id) {
            room.broadcaster = null;
            this.io.to(roomId).emit('broadcaster-left');
          }
          
          if (room.viewers.has(socket.id)) {
            room.viewers.delete(socket.id);
            this.io.to(roomId).emit('viewer-left', { viewerId: socket.id });
          }
          
          // Remove empty rooms
          if (!room.broadcaster && room.viewers.size === 0) {
            this.rooms.delete(roomId);
          }
        }
      });
    });
  }

  // Get active rooms info
  getActiveRooms() {
    const activeRooms = [];
    for (const [roomId, room] of this.rooms.entries()) {
      activeRooms.push({
        roomId,
        hasBroadcaster: !!room.broadcaster,
        viewerCount: room.viewers.size
      });
    }
    return activeRooms;
  }

  // Get room info
  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    return {
      roomId,
      hasBroadcaster: !!room.broadcaster,
      viewerCount: room.viewers.size,
      viewers: Array.from(room.viewers)
    };
  }
}

export default WebRTCServer; 