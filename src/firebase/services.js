import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  getAuth, 
  updateProfile as updateFirebaseProfile, 
  updatePassword as updateFirebasePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { db } from './config';

// Convert Firestore timestamp to JavaScript date
export const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  // Handle Firestore Timestamp objects
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // Handle timestamp objects with seconds and nanoseconds
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // Already a date or timestamp
  return timestamp;
};

// =====  User Management Services  ===== //

// Get all users
export const getUsers = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Get a single user by ID
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Update user status (active, suspended, etc.)
export const updateUserStatus = async (userId, newStatus) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Function to delete a user
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    // No Firebase Auth integration needed
    const userCollection = collection(db, 'users');
    const newUserData = {
      ...userData,
      created_at: serverTimestamp(),
      last_login: null
    };
    
    const docRef = await addDoc(userCollection, newUserData);
    return {
      id: docRef.id,
      ...newUserData
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updated_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Get users with real-time updates (sorted by creation date, newest first)
export const getUsersRealtime = (callback) => {
  try {
    console.log("Setting up users real-time listener");
    const usersCollection = collection(db, 'users');
    
    // Add orderBy to sort by creation date in descending order
    const q = query(usersCollection, orderBy('createdAt', 'desc'));
    
    // Return the unsubscribe function
    return onSnapshot(q, (snapshot) => {
      console.log(`Received ${snapshot.docs.length} users from Firestore`);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(usersData);
    }, (error) => {
      console.error("Error in users real-time listener:", error);
    });
  } catch (error) {
    console.error("Error setting up users listener:", error);
    throw error;
  }
};

// Get a specific user by ID with real-time updates
export const getUser = (userId, callback) => {
  try {
    console.log("Setting up user listener for:", userId);
    
    const userDocRef = doc(db, 'users', userId);
    
    // Return the unsubscribe function to clean up when component unmounts
    return onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = {
          id: docSnapshot.id,
          ...docSnapshot.data()
        };
        console.log("Retrieved user data:", userData);
        callback(userData);
      } else {
        console.log("No user found with ID:", userId);
        callback(null);
      }
    }, (error) => {
      console.error("Error in user real-time listener:", error);
    });
  } catch (error) {
    console.error("Error setting up user listener:", error);
    throw error;
  }
};

// Alternatively, for non-real-time needs
export const getUserOnce = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnapshot = await getDoc(userDocRef);
    
    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

// ===== Appointments Services ===== //

// Get all appointments
export const getAppointments = async () => {
  try {
    const appointmentsCollection = collection(db, 'appointments');
    const appointmentsSnapshot = await getDocs(appointmentsCollection);
    return appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

// Get a single appointment by ID
export const getAppointment = async (appointmentId) => {
  try {
    const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
    if (appointmentDoc.exists()) {
      return {
        id: appointmentDoc.id,
        ...appointmentDoc.data()
      };
    } else {
      throw new Error('Appointment not found');
    }
  } catch (error) {
    console.error('Error getting appointment:', error);
    throw error;
  }
};

// Update an appointment
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      ...appointmentData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

// Delete an appointment
export const deleteAppointment = async (appointmentId) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await deleteDoc(appointmentRef);
    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

// ===== Posts Services ===== //

// Get all posts
export const getPosts = async () => {
  try {
    const postsCollection = collection(db, 'posts');
    const postsSnapshot = await getDocs(postsCollection);
    return postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Get a single post by ID
export const getPost = async (postId) => {
  try {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (postDoc.exists()) {
      return {
        id: postDoc.id,
        ...postDoc.data()
      };
    } else {
      throw new Error('Post not found');
    }
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

// Update a post
export const updatePost = async (postId, postData) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...postData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Update the deletePost function
export const deletePost = async (postId) => {
  if (!postId) {
    throw new Error("Post ID is required");
  }

  console.log(`Attempting to delete post with ID: ${postId}`);
  
  try {
    // Reference to the post document
    const postRef = doc(db, 'posts', postId);
    
    // Delete the post document
    await deleteDoc(postRef);
    
    console.log(`Post ${postId} successfully deleted`);
    return true;
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

// ===== Reported Posts Services ===== //

// Get all reported posts
export const getReportedPosts = async () => {
  try {
    console.log("Fetching reported posts from Firestore...");
    const reportsCollection = collection(db, 'reported_posts'); // Verify this is your correct collection name
    const snapshot = await getDocs(reportsCollection);
    
    console.log(`Retrieved ${snapshot.docs.length} reported posts`);
    
    if (snapshot.empty) {
      console.log("No reported posts found in collection");
      return [];
    }
    
    const reportsData = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`Processing report ${doc.id}:`, data);
      
      return {
        id: doc.id,
        ...data,
        // Ensure posts have a status - default to 'pending' if not set
        status: data.status || 'pending',
        // Ensure dates are properly handled
        reportedAt: data.reportedAt ? data.reportedAt : new Date()
      };
    });
    
    console.log("Formatted reports data:", reportsData);
    return reportsData;
  } catch (error) {
    console.error("Error getting reported posts:", error);
    throw error;
  }
};

// Get a single reported post by ID
export const getReportedPost = async (reportId) => {
  try {
    console.log(`Fetching reported post with ID: ${reportId}`);
    
    // Get the report document
    const reportRef = doc(db, 'reported_posts', reportId);
    const reportSnapshot = await getDoc(reportRef);
    
    if (!reportSnapshot.exists()) {
      console.log(`No report found with ID: ${reportId}`);
      return null;
    }
    
    // Get the report data
    const reportData = {
      id: reportSnapshot.id,
      ...reportSnapshot.data()
    };
    
    // If the report contains a postId, fetch the associated post
    if (reportData.postId) {
      try {
        const postRef = doc(db, 'posts', reportData.postId);
        const postSnapshot = await getDoc(postRef);
        
        if (postSnapshot.exists()) {
          const postData = postSnapshot.data();
          
          // Add post data to the report
          reportData.postContent = postData.content;
          reportData.postTitle = postData.title;
          reportData.authorId = postData.userId;
          reportData.authorName = postData.userName;
          
          // If you have a users collection, you could fetch more user details here
          if (postData.userId) {
            try {
              const userRef = doc(db, 'users', postData.userId);
              const userSnapshot = await getDoc(userRef);
              
              if (userSnapshot.exists()) {
                reportData.authorDetails = userSnapshot.data();
              }
            } catch (userError) {
              console.error(`Error fetching author details: ${userError}`);
            }
          }
        }
      } catch (postError) {
        console.error(`Error fetching associated post: ${postError}`);
      }
    }
    
    console.log("Retrieved reported post data:", reportData);
    return reportData;
  } catch (error) {
    console.error(`Error getting reported post: ${error}`);
    throw error;
  }
};

// Add or update this function to handle report resolution
export const resolveReport = async (reportId, resolution, notes) => {
  try {
    console.log(`Resolving report ${reportId} with resolution: ${resolution}`);
    
    // Reference to the report document
    const reportRef = doc(db, 'reported_posts', reportId);
    
    // Update the report with resolution details
    await updateDoc(reportRef, {
      status: resolution === 'delete' ? 'deleted' : 
             (resolution === 'approve' ? 'approved' : 'rejected'),
      resolution: notes || `Report ${resolution === 'delete' ? 'deleted' : 
                          (resolution === 'approve' ? 'approved' : 'rejected')}`,
      resolvedAt: serverTimestamp(),
      resolvedBy: 'admin' // You might want to pass the current user's ID here
    });
    
    return true;
  } catch (error) {
    console.error(`Error resolving report: ${error}`);
    throw error;
  }
};

// Update post status (after report review)
export const updatePostStatus = async (postId, newStatus) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating post status:', error);
    throw error;
  }
};

// ===== Chats Services ===== //

// Get all chats for admin
export const getChats = async () => {
  try {
    console.log("Fetching chats from Firestore...");
    const chatsCollection = collection(db, 'chats');
    const snapshot = await getDocs(chatsCollection);
    
    console.log(`Retrieved ${snapshot.docs.length} chats`);
    
    const chatsData = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`Processing chat ${doc.id}:`, data);
      
      return {
        id: doc.id,
        ...data,
        // Don't attempt to convert timestamps here - handle in the UI
      };
    });
    
    return chatsData;
  } catch (error) {
    console.error("Error getting chats:", error);
    throw error;
  }
};

// Get messages for a specific chat
export const getChatMessages = async (chatId) => {
  try {
    console.log(`Fetching messages for chat ${chatId}...`);
    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    
    console.log(`Retrieved ${snapshot.docs.length} messages for chat ${chatId}`);
    
    // Log each message for debugging
    const messagesData = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`Message ${doc.id}:`, data);
      
      // Properly format the message object
      return {
        id: doc.id,
        text: data.text || data.content || data.message || "No content", // Try different field names
        sender: data.sender || data.senderType || 'unknown',
        timestamp: data.timestamp,
        status: data.status || 'sent'
      };
    });
    
    return messagesData;
  } catch (error) {
    console.error(`Error getting messages for chat ${chatId}:`, error);
    throw error;
  }
};

// Send a message in a chat
export const sendMessage = async (chatId, messageData) => {
  try {
    // Ensure messageData has the correct structure
    const formattedMessage = {
      text: messageData.text,
      sender: messageData.sender, // 'admin' or 'user'
      timestamp: serverTimestamp(),
      status: 'sent'
    };
    
    console.log(`Sending message to chat ${chatId}:`, formattedMessage);
    
    // Add the message to the messages subcollection
    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    const docRef = await addDoc(messagesCollection, formattedMessage);
    
    // Update the chat document with the last message info
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: messageData.text,
      lastMessageTime: serverTimestamp(),
      lastMessageSender: messageData.sender
    });
    
    console.log(`Message sent successfully with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`Error sending message to chat ${chatId}:`, error);
    throw error;
  }
};

// Mark a chat as read
export const markChatAsRead = async (chatId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      unreadCount: 0,
      lastReadByAdmin: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error marking chat as read:', error);
    throw error;
  }
};

// ===== Settings Services ===== //

// Get application settings
export const getSettings = async () => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'appSettings'));
    if (settingsDoc.exists()) {
      return settingsDoc.data();
    } else {
      // Return default settings if not found
      return {
        general: {
          siteName: 'TeamLexia',
          siteDescription: 'An admin panel for TeamLexia application',
          supportEmail: 'support@teamlexia.com',
          enableRegistration: true,
          maintenanceMode: false,
          enableNotifications: true,
          defaultLanguage: 'en',
          defaultTheme: 'light'
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          newUserAlerts: true,
          reportAlerts: true,
          systemUpdates: true,
          marketingEmails: false
        }
      };
    }
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

// Update application settings
export const updateSettings = async (settingsData) => {
  try {
    const settingsRef = doc(db, 'settings', 'appSettings');
    
    // Get current settings to merge with updates
    const currentSettings = await getSettings();
    
    // Merge current settings with new ones
    const mergedSettings = {
      ...currentSettings,
      ...settingsData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(settingsRef, mergedSettings);
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) throw new Error('No authenticated user found');
    
    // Update Firebase Auth profile
    await updateFirebaseProfile(user, {
      displayName: profileData.displayName,
      photoURL: profileData.avatarUrl
    });
    
    // Update additional profile data in Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      displayName: profileData.displayName,
      photoURL: profileData.avatarUrl,
      phoneNumber: profileData.phoneNumber,
      bio: profileData.bio,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Update user password
export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) throw new Error('No authenticated user found');
    if (!user.email) throw new Error('User has no email address associated');
    
    // Re-authenticate the user before changing password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(user, credential);
    
    // Update the password
    await updateFirebasePassword(user, newPassword);
    
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Export all services
export default {
  getUsers,
  getUser, // real-time version
  getUserById, // single fetch version
  updateUserStatus,
  deleteUser,
  createUser,
  updateUser,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  getReportedPosts,
  getReportedPost,
  resolveReport,
  updatePostStatus,
  markChatAsRead,
  getSettings,
  updateSettings,
  updateProfile,
  updatePassword
};
