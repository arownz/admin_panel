import { db } from './config';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  where
} from 'firebase/firestore';

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
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
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
    
    // Add orderBy to sort by creation date in descending order - use created_at instead of createdAt
    const q = query(usersCollection, orderBy('created_at', 'desc'));
    
    // Return the unsubscribe function
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(users);
    }, (error) => {
      console.error("Users listener error:", error);
      callback([]);
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
        callback(userData);
      } else {
        console.log("User not found");
        callback(null);
      }
    }, (error) => {
      console.error("User listener error:", error);
      callback(null);
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
      throw new Error('User not found');
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
    const snapshot = await getDocs(appointmentsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting appointments:', error);
    return [];
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
    const snapshot = await getDocs(postsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
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
    const reportsCollection = collection(db, 'reported_posts');
    const snapshot = await getDocs(reportsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting reported posts:', error);
    return [];
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
      throw new Error('Reported post not found');
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
          reportData.post = {
            id: postSnapshot.id,
            ...postSnapshot.data()
          };
        }
      } catch (postError) {
        console.warn(`Could not fetch associated post: ${postError.message}`);
        // Continue without the post data if it's not available
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
      resolvedBy: 'admin'
    });
    
    console.log(`Report ${reportId} resolved successfully`);
    return true;
  } catch (error) {
    console.error(`Error resolving report ${reportId}:`, error);
    throw new Error(`Failed to resolve report: ${error.message}`);
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

// ===== CHAT SERVICES REMOVED FOR DATA PRIVACY COMPLIANCE ===== //
// All chat-related functions have been removed to comply with data privacy regulations

// ===== Settings Services ===== //

// Get application settings
export const getSettings = async () => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
    if (settingsDoc.exists()) {
      return settingsDoc.data();
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

// Update application settings
export const updateSettings = async (settingsData) => {
  try {
    const settingsRef = doc(db, 'settings', 'app');
    await updateDoc(settingsRef, {
      ...settingsData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async () => {
  try {
    // Implementation depends on your auth system
    console.log('Profile update not implemented for current auth system');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Update user password
export const updatePassword = async () => {
  try {
    // Implementation depends on your auth system
    console.log('Password update not implemented for current auth system');
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// ===== Admin Codes Services ===== //

// Generate a new admin code
export const generateAdminCode = async (generatedBy, expiresInHours = 24, isOneTime = true) => {
  try {
    // Generate a random 8-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const adminCodeData = {
      code,
      generatedBy,
      generatedAt: serverTimestamp(),
      expiresAt,
      isOneTime,
      isUsed: false,
      usedAt: null,
      usedBy: null
    };

    const docRef = await addDoc(collection(db, 'adminCodes'), adminCodeData);
    
    return {
      id: docRef.id,
      ...adminCodeData
    };
  } catch (error) {
    console.error('Error generating admin code:', error);
    throw error;
  }
};

// Validate admin code
export const validateAdminCode = async (code) => {
  try {
    const q = query(
      collection(db, 'adminCodes'),
      where('code', '==', code),
      where('isUsed', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { valid: false, reason: 'Invalid or already used code' };
    }

    const codeDoc = querySnapshot.docs[0];
    const codeData = codeDoc.data();
    
    // Check if code is expired
    const now = new Date();
    const expiresAt = codeData.expiresAt.toDate();
    
    if (now > expiresAt) {
      return { valid: false, reason: 'Code has expired' };
    }

    return { 
      valid: true, 
      codeId: codeDoc.id, 
      codeData: {
        ...codeData,
        expiresAt: expiresAt
      }
    };
  } catch (error) {
    console.error('Error validating admin code:', error);
    throw error;
  }
};

// Mark admin code as used
export const markCodeAsUsed = async (codeId, usedBy = 'admin') => {
  try {
    const codeRef = doc(db, 'adminCodes', codeId);
    await updateDoc(codeRef, {
      isUsed: true,
      usedAt: serverTimestamp(),
      usedBy
    });
    return true;
  } catch (error) {
    console.error('Error marking code as used:', error);
    throw error;
  }
};

// Get all admin codes (for management)
export const getAdminCodes = async () => {
  try {
    const q = query(
      collection(db, 'adminCodes'),
      orderBy('generatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const codes = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      codes.push({
        id: doc.id,
        ...data,
        generatedAt: data.generatedAt?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        usedAt: data.usedAt?.toDate()
      });
    });
    
    return codes;
  } catch (error) {
    console.error('Error fetching admin codes:', error);
    throw error;
  }
};

// Delete admin code
export const deleteAdminCode = async (codeId) => {
  try {
    await deleteDoc(doc(db, 'adminCodes', codeId));
    return true;
  } catch (error) {
    console.error('Error deleting admin code:', error);
    throw error;
  }
};

// Cleanup expired codes and used one-time codes
export const cleanupExpiredCodes = async () => {
  try {
    const now = new Date();
    
    // Query 1: Get expired codes
    const expiredQuery = query(
      collection(db, 'adminCodes'),
      where('expiresAt', '<', now)
    );
    
    // Query 2: Get used one-time codes
    const usedOneTimeQuery = query(
      collection(db, 'adminCodes'),
      where('isOneTime', '==', true),
      where('isUsed', '==', true)
    );
    
    const [expiredSnapshot, usedOneTimeSnapshot] = await Promise.all([
      getDocs(expiredQuery),
      getDocs(usedOneTimeQuery)
    ]);
    
    const deletePromises = [];
    const deletedIds = new Set();
    
    // Collect expired codes
    expiredSnapshot.forEach((doc) => {
      if (!deletedIds.has(doc.id)) {
        deletePromises.push(deleteDoc(doc.ref));
        deletedIds.add(doc.id);
      }
    });
    
    // Collect used one-time codes
    usedOneTimeSnapshot.forEach((doc) => {
      if (!deletedIds.has(doc.id)) {
        deletePromises.push(deleteDoc(doc.ref));
        deletedIds.add(doc.id);
      }
    });
    
    await Promise.all(deletePromises);
    return deletedIds.size; // Return number of deleted codes
  } catch (error) {
    console.error('Error cleaning up expired codes:', error);
    throw error;
  }
};

// ===== Verification Requests Services ===== //

// Get all verification requests
export const getVerificationRequests = async () => {
  try {
    const verificationsCollection = collection(db, 'verification_requests');
    const snapshot = await getDocs(verificationsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting verification requests:', error);
    return [];
  }
};

// Get a single verification request by ID
export const getVerificationRequest = async (requestId) => {
  try {
    console.log(`Fetching verification request with ID: ${requestId}`);
    
    const requestRef = doc(db, 'verification_requests', requestId);
    const requestSnapshot = await getDoc(requestRef);
    
    if (!requestSnapshot.exists()) {
      throw new Error('Verification request not found');
    }
    
    const requestData = {
      id: requestSnapshot.id,
      ...requestSnapshot.data(),
      submittedAt: convertTimestamp(requestSnapshot.data().submittedAt),
      processedAt: convertTimestamp(requestSnapshot.data().processedAt),
    };
    
    console.log("Retrieved verification request data:", requestData);
    return requestData;
  } catch (error) {
    console.error(`Error getting verification request: ${error}`);
    throw error;
  }
};

// Update verification request status AND user verification status
export const updateVerificationStatus = async (requestId, status, adminNotes = '') => {
  try {
    console.log(`Updating verification request ${requestId} to status: ${status}`);
    
    // First, get the verification request to find the userId
    const requestRef = doc(db, 'verification_requests', requestId);
    const requestSnapshot = await getDoc(requestRef);
    
    if (!requestSnapshot.exists()) {
      throw new Error('Verification request not found');
    }
    
    const requestData = requestSnapshot.data();
    const userId = requestData.userId;
    
    if (!userId) {
      throw new Error('User ID not found in verification request');
    }
    
    // Update the verification request
    const updateData = {
      status: status,
      processedAt: serverTimestamp(),
      adminNotes: adminNotes
    };

    if (status === 'approved') {
      updateData.isAutoVerified = true;
    }
    
    await updateDoc(requestRef, updateData);
    
    // 🔥 THE MISSING LINK: Update the user's verification status in the users collection
    if (status === 'approved') {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userRef);
        
        if (userSnapshot.exists()) {
          await updateDoc(userRef, {
            isVerified: true,
            verifiedAt: serverTimestamp(),
            verificationStatus: 'verified',
            profession: requestData.profession,
            affiliation: requestData.affiliation,
            licenseNumber: requestData.licenseNumber || null,
            updatedAt: serverTimestamp()
          });
          
          console.log(`✅ User ${userId} verification status updated to verified`);
        } else {
          console.warn(`⚠️ User ${userId} not found in users collection`);
        }
      } catch (userError) {
        console.error(`❌ Error updating user verification status: ${userError.message}`);
        // Don't throw here - verification request update was successful
      }
    }
    
    // If rejected, update user status as well
    if (status === 'rejected') {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userRef);
        
        if (userSnapshot.exists()) {
          await updateDoc(userRef, {
            verificationStatus: 'rejected',
            rejectedAt: serverTimestamp(),
            rejectionReason: adminNotes || 'Verification request rejected',
            updatedAt: serverTimestamp()
          });
          
          console.log(`✅ User ${userId} verification status updated to rejected`);
        }
      } catch (userError) {
        console.error(`❌ Error updating user rejection status: ${userError.message}`);
        // Don't throw here - verification request update was successful
      }
    }
    
    console.log(`✅ Verification request ${requestId} updated successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating verification request ${requestId}:`, error);
    throw new Error(`Failed to update verification request: ${error.message}`);
  }
};

// Delete a verification request
export const deleteVerificationRequest = async (requestId) => {
  try {
    console.log(`Deleting verification request ${requestId}`);
    
    const requestRef = doc(db, 'verification_requests', requestId);
    await deleteDoc(requestRef);
    
    console.log(`Verification request ${requestId} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting verification request ${requestId}:`, error);
    throw new Error(`Failed to delete verification request: ${error.message}`);
  }
};

// Export all services (added verification request services)
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
  // Verification request services
  getVerificationRequests,
  getVerificationRequest,
  updateVerificationStatus,
  deleteVerificationRequest,
  // Removed chat services for data privacy compliance
  getSettings,
  updateSettings,
  updateProfile,
  updatePassword
};
