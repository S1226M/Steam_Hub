# WebRTC Live Streaming Implementation

This document describes the alternative live streaming functionality using WebRTC technology, which provides real-time, low-latency streaming directly in the browser without requiring external streaming servers.

## 🚀 Features

### WebRTC Live Streaming

- **Real-time streaming**: Ultra-low latency (100-500ms) compared to traditional RTMP/HLS
- **Peer-to-peer connections**: Direct browser-to-browser communication
- **No external servers**: No need for RTMP servers or CDN infrastructure
- **Built-in chat**: Real-time chat functionality during streams
- **Room-based system**: Unique rooms for each stream session
- **Viewer management**: Track and display viewer counts
- **Private streams**: Option to create private streaming rooms

### Technical Advantages

- **Lower latency**: WebRTC provides near-instantaneous streaming
- **Better quality**: Direct peer connections maintain video quality
- **Scalability**: Each viewer connects directly to the broadcaster
- **Cost-effective**: No server infrastructure costs for streaming
- **Cross-platform**: Works on all modern browsers and devices

## 📁 File Structure

### Backend Files

```
backend/
├── webrtc-server.js          # WebRTC signaling server
├── controller/
│   └── webrtc.controller.js  # WebRTC API controllers
├── route/
│   └── webrtc.route.js       # WebRTC API routes
├── model/
│   └── livestream.model.js   # Updated model with WebRTC support
└── app.js                    # Updated main server file
```

### Frontend Files

```
Frontend/Stream_Hub_Interface/src/components/User/
├── WebRTCLiveStream.jsx      # Main WebRTC component
└── WebRTCLiveStream.css      # Styling for WebRTC component
```

## 🛠️ Installation & Setup

### Backend Dependencies

```bash
cd backend
npm install socket.io wrtc uuid
```

### Frontend Dependencies

```bash
cd Frontend/Stream_Hub_Interface
npm install socket.io-client
```

### Environment Variables

Add to your `.env` file:

```env
# WebRTC Configuration
WEBRTC_PORT=5000
STUN_SERVER_1=stun:stun.l.google.com:19302
STUN_SERVER_2=stun:stun1.l.google.com:19302
```

## 🔧 API Endpoints

### WebRTC Live Streaming Endpoints

#### Create Stream Room

```http
POST /api/webrtc/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Live Stream",
  "description": "Stream description",
  "isPrivate": false
}
```

#### Get All WebRTC Streams

```http
GET /api/webrtc/all?page=1&limit=10&status=live
```

#### Get Active WebRTC Streams

```http
GET /api/webrtc/active
```

#### Get User's WebRTC Streams

```http
GET /api/webrtc/user/:userId
Authorization: Bearer <token>
```

#### Get Specific WebRTC Stream

```http
GET /api/webrtc/:streamId
```

#### Start WebRTC Stream

```http
POST /api/webrtc/:streamId/start
Authorization: Bearer <token>
```

#### Stop WebRTC Stream

```http
POST /api/webrtc/:streamId/stop
Authorization: Bearer <token>
```

#### Delete WebRTC Stream

```http
DELETE /api/webrtc/:streamId
Authorization: Bearer <token>
```

## 🎥 Usage Guide

### For Broadcasters

1. **Create a Stream Room**

   - Navigate to the WebRTC Live Streaming page
   - Enter stream title and description
   - Choose if the stream should be private
   - Click "Create Stream Room"

2. **Start Broadcasting**

   - Allow camera and microphone permissions
   - Your local video will appear in the preview
   - Viewers can now join your stream

3. **Manage Your Stream**
   - Monitor viewer count in real-time
   - Use the chat feature to interact with viewers
   - Click "Stop Broadcasting" when finished

### For Viewers

1. **Browse Active Streams**

   - View the list of available live streams
   - See stream title, broadcaster, and viewer count

2. **Join a Stream**

   - Click "Join Stream" on any active stream
   - The broadcaster's video will appear
   - Use chat to interact with the broadcaster and other viewers

3. **Leave Stream**
   - Click "Leave Stream" to exit
   - You can join other streams or create your own

## 🔌 WebRTC Signaling Events

### Client to Server Events

- `join-room`: Join a streaming room
- `offer`: Send WebRTC offer to viewer
- `answer`: Send WebRTC answer to broadcaster
- `ice-candidate`: Send ICE candidate
- `request-stream`: Request stream from broadcaster
- `stream-started`: Notify stream has started
- `stream-stopped`: Notify stream has stopped
- `chat-message`: Send chat message

### Server to Client Events

- `room-joined`: Confirm room join
- `viewer-joined`: New viewer joined
- `viewer-left`: Viewer left the room
- `viewer-request-stream`: Viewer requesting stream
- `offer`: Receive WebRTC offer
- `answer`: Receive WebRTC answer
- `ice-candidate`: Receive ICE candidate
- `stream`: Receive video stream
- `broadcaster-started-stream`: Broadcaster started
- `broadcaster-stopped-stream`: Broadcaster stopped
- `broadcaster-left`: Broadcaster left
- `chat-message`: Receive chat message

## 🎯 Key Features Explained

### Room Management

- Each stream gets a unique room ID (UUID)
- Rooms are created when a broadcaster starts streaming
- Rooms are automatically cleaned up when empty

### Peer Connections

- WebRTC peer connections are established between broadcaster and each viewer
- STUN servers help with NAT traversal
- ICE candidates are exchanged for optimal connection paths

### Chat System

- Real-time chat using Socket.IO
- Messages are broadcast to all users in the room
- Username and timestamp included with each message

### Viewer Tracking

- Real-time viewer count updates
- Notifications when viewers join/leave
- Automatic cleanup when viewers disconnect

## 🔒 Security Considerations

### Authentication

- All stream creation requires valid JWT token
- Users can only manage their own streams
- Private streams are supported

### Room Security

- Room IDs are UUIDs (practically unguessable)
- No authentication required to join public streams
- Private streams can be implemented with additional security

### Media Permissions

- Browser handles camera/microphone permissions
- Users must explicitly grant access
- Streams stop if permissions are revoked

## 🚀 Performance Optimization

### Connection Management

- Automatic cleanup of disconnected peers
- Efficient room management
- Memory leak prevention

### Video Quality

- WebRTC automatically adapts to network conditions
- Multiple quality levels supported
- Bandwidth optimization

### Scalability

- Each viewer connects directly to broadcaster
- No server bottleneck for video streaming
- Signaling server only handles coordination

## 🐛 Troubleshooting

### Common Issues

1. **Camera/Microphone Not Working**

   - Check browser permissions
   - Ensure HTTPS is used (required for getUserMedia)
   - Try refreshing the page

2. **Connection Issues**

   - Check firewall settings
   - Ensure STUN servers are accessible
   - Try different network (mobile vs WiFi)

3. **Stream Not Starting**

   - Check browser console for errors
   - Verify WebRTC support in browser
   - Ensure all dependencies are installed

4. **Chat Not Working**
   - Check Socket.IO connection
   - Verify server is running
   - Check network connectivity

### Browser Support

- Chrome 56+
- Firefox 52+
- Safari 11+
- Edge 79+

## 🔄 Comparison with RTMP/HLS

| Feature         | WebRTC                 | RTMP/HLS          |
| --------------- | ---------------------- | ----------------- |
| Latency         | 100-500ms              | 2-10 seconds      |
| Quality         | High                   | Variable          |
| Infrastructure  | None required          | RTMP server + CDN |
| Cost            | Low                    | High              |
| Scalability     | Limited by broadcaster | Unlimited         |
| Browser Support | Modern browsers        | All browsers      |
| Mobile Support  | Excellent              | Good              |

## 📈 Future Enhancements

### Planned Features

- **Recording**: Save streams to video files
- **Screen sharing**: Share screen instead of camera
- **Multiple cameras**: Switch between different video sources
- **Stream analytics**: Detailed viewer statistics
- **Moderation tools**: Chat moderation and user management
- **Stream scheduling**: Pre-schedule stream times
- **Notifications**: Alert followers when stream starts

### Technical Improvements

- **TURN servers**: Better NAT traversal
- **Adaptive bitrate**: Dynamic quality adjustment
- **Stream transcoding**: Multiple quality options
- **CDN integration**: Hybrid WebRTC + CDN approach
- **Mobile optimization**: Better mobile experience

## 📞 Support

For technical support or questions about the WebRTC implementation:

1. Check the browser console for error messages
2. Verify all dependencies are installed
3. Ensure proper network connectivity
4. Test with different browsers/devices

The WebRTC implementation provides a modern, efficient alternative to traditional streaming methods, offering ultra-low latency and high-quality video streaming directly in the browser.
