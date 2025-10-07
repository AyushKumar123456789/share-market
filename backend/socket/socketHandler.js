const { Server } = require("socket.io");
const Conversation = require('../models/conversation');
const Message = require('../models/message');

const userSocketMap = {}; // { userId: socketId }

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected with socket ID: ${socket.id}`);
        const userId = socket.handshake.query.userId;
        if (userId !== "undefined") {
            userSocketMap[userId] = socket.id;
             console.log(`✅ User connected: ${userId} with socket ID: ${socket.id}`);
        }

     socket.on('sendMessage', async ({ conversationId, sender, text, recipient }) => {
            try {
                let conversation;
                
                // 1. Find or Create the Conversation
                if (conversationId) {
                    conversation = await Conversation.findById(conversationId);
                } else {
                    conversation = await Conversation.findOne({ participants: { $all: [sender, recipient] } });
                    if (!conversation) {
                        conversation = new Conversation({ participants: [sender, recipient] });
                        // If the conversation is new, we MUST save it first to get an _id
                        await conversation.save(); 
                    }
                }
                
                // 2. Create the New Message
                // Now, conversation._id is guaranteed to exist.
                const newMessage = new Message({
                    conversationId: conversation._id,
                    sender,
                    text
                });

                // 3. Update Conversation and Save Everything
                conversation.lastMessage = { text, sender };
                
                // Save both the new message and the updated conversation in parallel for efficiency
                await Promise.all([newMessage.save(), conversation.save()]);
                
                // 4. Populate the message with sender info for the frontend
                const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name profilePhoto');
                const populatedConversation = await Conversation.findById(conversation._id).populate('participants', 'name profilePhoto');

                // 5. Emit the new message to the recipient and sender
                const recipientSocketId = userSocketMap[recipient];
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('newMessage', { message: populatedMessage, conversation: populatedConversation });
                }
                socket.emit('newMessage', { message: populatedMessage, conversation: populatedConversation });

            } catch (error) { 
                console.error("Send Message Error:", error); 
            }
        });
    });

    return io;
};

module.exports = { initializeSocket };