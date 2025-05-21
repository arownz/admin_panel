import { useState, useEffect, useRef } from 'react';
import { Container, Card, Row, Col, Form, Button, ListGroup, Badge, Alert } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { getChats, getChatMessages, sendMessage, markChatAsRead } from '../../firebase/services';

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  
  // Fetch all chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const chatsData = await getChats();
        console.log("Raw chats data:", chatsData);
        
        // Log details of each chat
        chatsData.forEach(chat => {
          console.log(`Chat ${chat.id}:`, {
            userName: chat.userName,
            lastMessage: chat.lastMessage,
            lastMessageTime: chat.lastMessageTime,
            lastMessageTimeType: typeof chat.lastMessageTime,
            hasToDateMethod: chat.lastMessageTime && typeof chat.lastMessageTime.toDate === 'function'
          });
        });
        
        setChats(chatsData);
        
        // Select the first chat if none is selected
        if (chatsData.length > 0 && !selectedChat) {
          setSelectedChat(chatsData[0]);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError("Failed to load chats. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, []);
  
  // Fetch messages for selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      
      try {
        setLoading(true);
        const messagesData = await getChatMessages(selectedChat.id);
        setMessages(messagesData);
        
        // Mark chat as read when opened
        if (selectedChat.unreadCount > 0) {
          await markChatAsRead(selectedChat.id);
          
          // Update the chats list to reflect the read status
          setChats(chats.map(chat => 
            chat.id === selectedChat.id ? { ...chat, unreadCount: 0 } : chat
          ));
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Optional: Set up real-time listener for new messages in this chat
    // return () => unsubscribe();
  }, [selectedChat]);
  
  // Scroll to bottom when new messages are loaded
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      await sendMessage(selectedChat.id, {
        text: newMessage,
        sender: 'admin',
        timestamp: new Date().toISOString()
      });
      
      // Optionally update local messages state to show the sent message immediately
      setMessages([...messages, {
        id: Date.now().toString(), // temporary ID
        text: newMessage,
        sender: 'admin',
        timestamp: new Date().toISOString(),
        status: 'sending'
      }]);
      
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };
  
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setError(null); // Clear any previous errors
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      let date;
      
      // Handle Firestore Timestamp objects
      if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      }
      // Handle timestamp objects with seconds and nanoseconds
      else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Already a date string or ISO format
      else {
        date = new Date(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid timestamp:", timestamp);
        return 'N/A';
      }
      
      const today = new Date();
      
      // If the message is from today, just show the time
      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // If the message is from this year, show the month and day
      if (date.getFullYear() === today.getFullYear()) {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      
      // Otherwise, show the full date
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'N/A';
    }
  };
  
  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    return (
      chat.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <Container fluid className="py-3">
          <h1 className="mb-4">Chat Messages</h1>
          
          {error && (
            <Alert variant="danger">{error}</Alert>
          )}
          
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Row className="g-0" style={{ minHeight: '70vh' }}>
                {/* Chat List */}
                <Col md={4} className="border-end">
                  <div className="p-3">
                    <Form.Control
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-3"
                    />
                  </div>
                  
                  <ListGroup variant="flush" className="chat-list">
                    {filteredChats.length > 0 ? (
                      filteredChats.map(chat => (
                        <ListGroup.Item 
                          key={chat.id} 
                          action 
                          active={selectedChat?.id === chat.id}
                          onClick={() => handleChatSelect(chat)}
                          className={`d-flex align-items-center p-3 ${chat.unreadCount > 0 ? 'fw-bold' : ''}`}
                        >
                          <div className="chat-avatar me-3">
                            {chat.userAvatar ? (
                              <img 
                                src={chat.userAvatar} 
                                alt={chat.userName} 
                                className="rounded-circle"
                                width="40"
                                height="40"
                              />
                            ) : (
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                {chat.userName?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="chat-name">{chat.userName || 'Unknown User'}</span>
                              <small className="text-muted">
                                {formatTimestamp(chat.lastMessageTime)}
                              </small>
                            </div>
                            <div className="chat-preview text-truncate text-muted small">
                              {chat.lastMessage || 'No messages yet'}
                            </div>
                          </div>
                          {chat.unreadCount > 0 && (
                            <Badge bg="primary" pill className="ms-2">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </ListGroup.Item>
                      ))
                    ) : (
                      <div className="text-center p-4 text-muted">
                        {searchTerm ? 'No chats match your search' : 'No chats available'}
                      </div>
                    )}
                  </ListGroup>
                </Col>
                
                {/* Chat Messages */}
                <Col md={8}>
                  {selectedChat ? (
                    <div className="d-flex flex-column h-100">
                      {/* Chat Header */}
                      <div className="chat-header p-3 border-bottom">
                        <div className="d-flex align-items-center">
                          <div className="chat-avatar me-3">
                            {selectedChat.userAvatar ? (
                              <img 
                                src={selectedChat.userAvatar} 
                                alt={selectedChat.userName} 
                                className="rounded-circle"
                                width="40"
                                height="40"
                              />
                            ) : (
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                {selectedChat.userName?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="mb-0">{selectedChat.userName || 'Unknown User'}</h5>
                            <div className="text-muted small">
                              {selectedChat.isOnline ? (
                                <span className="text-success">
                                  <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                                  Online
                                </span>
                              ) : (
                                <span>Last active: {formatTimestamp(selectedChat.lastActive)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Messages Container */}
                      <div 
                        className="chat-messages p-3 flex-grow-1 overflow-auto"
                        ref={messageContainerRef}
                        style={{ maxHeight: 'calc(70vh - 130px)' }}
                      >
                        {messages.length > 0 ? (
                          messages.map((message, index) => {
                            // Add debug logging for each message
                            console.log(`Rendering message ${index}:`, message);
                            
                            const isAdmin = message.sender === 'admin';
                            const messageClass = isAdmin ? 'chat-message-admin' : 'chat-message-user';
                            
                            // Check if message has text content
                            const messageText = message.text || message.content || message.message || "No content available";
                            
                            return (
                              <div 
                                key={message.id || index} 
                                className={`chat-message ${messageClass} mb-3`}
                              >
                                <div className={`d-inline-block p-3 rounded ${isAdmin ? 'bg-primary text-white' : 'bg-light'}`}>
                                  {messageText}
                                </div>
                                <div className="text-muted small mt-1">
                                  {formatTimestamp(message.timestamp)}
                                  {isAdmin && message.status === 'sending' && (
                                    <i className="bi bi-clock ms-1"></i>
                                  )}
                                  {isAdmin && message.status === 'sent' && (
                                    <i className="bi bi-check ms-1"></i>
                                  )}
                                  {isAdmin && message.status === 'delivered' && (
                                    <i className="bi bi-check-all ms-1"></i>
                                  )}
                                  {isAdmin && message.status === 'read' && (
                                    <i className="bi bi-check-all text-primary ms-1"></i>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center p-4 text-muted">
                            No messages yet. Start the conversation!
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                      
                      {/* Message Input */}
                      <div className="chat-status-bar p-3 border-top bg-light text-center">
                        <small className="text-muted">
                          <i className="bi bi-eye me-1"></i> 
                          View-only mode
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className="h-100 d-flex align-items-center justify-content-center">
                      <div className="text-center text-muted">
                        <i className="bi bi-chat-dots fs-1 mb-3"></i>
                        <p>Select a chat to start messaging</p>
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default Chats;