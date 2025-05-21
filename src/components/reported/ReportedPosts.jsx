import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { getReportedPosts, resolveReport, deletePost } from '../../firebase/services';
import { Modal, Button } from 'react-bootstrap';

const ReportedPosts = () => {
  // Add this console log at the beginning of your component
  console.log("Rendering ReportedPosts component");

  const [reportedPosts, setReportedPosts] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // Changed from 'pending' to 'all'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmAction, setShowConfirmAction] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReportedPosts = async () => {
      console.log("Starting to fetch reported posts");
      try {
        setLoading(true);
        const reportedPostsData = await getReportedPosts();
        console.log("Fetched reported posts data:", reportedPostsData);
        
        setReportedPosts(reportedPostsData);
        setFilteredReports(reportedPostsData);
      } catch (err) {
        console.error("Error fetching reported posts:", err);
        setError("Failed to load reported posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportedPosts(); // This line ensures the function is actually called
  }, []);

  useEffect(() => {
    if (!reportedPosts || reportedPosts.length === 0) {
      setFilteredReports([]);
      return;
    }
    
    let results = [...reportedPosts];
    console.log("Filtering reports. Starting count:", results.length);
    
    // Apply reason filter
    if (reasonFilter !== 'all') {
      results = results.filter(report => report.reason === reasonFilter);
      console.log(`After reason filter (${reasonFilter}):`, results.length);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(report => report.status === statusFilter);
      console.log(`After status filter (${statusFilter}):`, results.length);
    }
    
    // Apply search term
    if (searchTerm) {
      results = results.filter(report => 
        (report.post?.content?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.post?.authorName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      console.log(`After search filter (${searchTerm}):`, results.length);
    }
    
    setFilteredReports(results);
  }, [searchTerm, reasonFilter, statusFilter, reportedPosts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleReasonChange = (e) => {
    setReasonFilter(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleActionClick = (report, action) => {
    setSelectedReport(report);
    setActionType(action);
    setShowConfirmAction(true);
  };

  // Update the confirmAction function to use Firebase
  const confirmAction = async () => {
    try {
      if (actionType === 'dismiss') {
        // Resolve the report as dismissed/rejected
        await resolveReport(selectedReport.id, 'reject', 'Report dismissed by admin');
        
        // Update local state to change status rather than remove
        const updatedReports = reportedPosts.map(report => 
          report.id === selectedReport.id 
            ? { ...report, status: 'rejected', resolvedAt: new Date() } 
            : report
        );
        setReportedPosts(updatedReports);
        setFilteredReports(updatedReports);
      } else if (actionType === 'remove') {
        // Resolve the report and delete the post
        console.log(`Attempting to delete post ${selectedReport.postId}`);
        
        try {
          await deletePost(selectedReport.postId);
          console.log(`Post ${selectedReport.postId} deleted successfully`);
        } catch (postError) {
          console.error("Error deleting post:", postError);
          // Continue with report resolution even if post deletion fails
        }
        
        try {
          await resolveReport(selectedReport.id, 'delete', 'Post removed due to violation');
          console.log(`Report ${selectedReport.id} resolved successfully`);
        } catch (reportError) {
          console.error("Error resolving report:", reportError);
        }
        
        // Update local state to change status rather than remove
        const updatedReports = reportedPosts.map(report => 
          report.id === selectedReport.id 
            ? { ...report, status: 'deleted', resolvedAt: new Date() } 
            : report
        );
        setReportedPosts(updatedReports);
        setFilteredReports(updatedReports);
      }
      
      // Always close the modal and reset state
      setShowConfirmAction(false);
      setSelectedReport(null);
      setActionType('');
    } catch (err) {
      console.error(`Error ${actionType === 'dismiss' ? 'dismissing report' : 'removing post'}:`, err);
      setError(`Failed to ${actionType === 'dismiss' ? 'dismiss report' : 'remove post'}. Please try again.`);
      
      // Still close the modal to avoid being stuck
      setShowConfirmAction(false);
      setSelectedReport(null);
      setActionType('');
    }
  };

  const cancelAction = () => {
    setShowConfirmAction(false);
    setSelectedReport(null);
    setActionType('');
  };

  const getReasons = () => {
    const reasons = new Set();
    reportedPosts.forEach(report => {
      if (report.reason) reasons.add(report.reason);
    });
    return Array.from(reasons);
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <div className="data-table-container">
          <div className="data-table-header">
            <h2>Reported Posts</h2>
            <div className="d-flex">
              <div className="me-2">
                <select 
                  className="form-select" 
                  value={reasonFilter}
                  onChange={handleReasonChange}
                >
                  <option value="all">All Reasons</option>
                  {getReasons().map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              <div className="me-2">
                <select 
                  className="form-select" 
                  value={statusFilter}
                  onChange={handleStatusChange}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Dismissed</option>
                  <option value="deleted">Removed</option>
                </select>
              </div>
              <div className="search-bar">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Reported Content</th>
                    <th>Author</th>
                    <th>Reported By</th>
                    <th>Reason</th>
                    <th>Status</th> {/* New column */}
                    <th>Reported At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => (
                    <tr key={report.id} className={report.status !== 'pending' ? 'table-secondary' : ''}>
                      <td>{report.id}</td>
                      <td>
                        {report.post?.content 
                          ? (report.post.content.length > 50
                            ? report.post.content.substring(0, 50) + '...'
                            : report.post.content)
                          : 'Content not available'}
                      </td>
                      <td>{report.post?.authorName || 'Unknown'}</td>
                      <td>{report.reportedBy}</td>
                      <td>
                        <span className="badge bg-warning">{report.reason}</span>
                      </td>
                      <td>
                        {report.status === 'pending' && <span className="badge bg-warning">Pending</span>}
                        {report.status === 'rejected' && <span className="badge bg-secondary">Dismissed</span>}
                        {report.status === 'deleted' && <span className="badge bg-danger">Removed</span>}
                      </td>
                      <td>{new Date(report.reportedAt).toLocaleString()}</td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/reported-posts/${report.id}`} className="btn btn-sm btn-info">
                            <i className="bi bi-eye"></i>
                          </Link>
                          {report.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleActionClick(report, 'dismiss')}
                                title="Dismiss Report"
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleActionClick(report, 'remove')}
                                title="Remove Post"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Confirmation modal */}
          <Modal 
            show={showConfirmAction} 
            onHide={cancelAction}
            style={{ zIndex: 1060 }}
            backdrop="static" // This forces the user to interact with the modal
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {actionType === 'dismiss' ? 'Dismiss Report' : 'Remove Post'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {actionType === 'dismiss' ? (
                <p>Are you sure you want to dismiss this report?</p>
              ) : (
                <>
                  <p>Are you sure you want to remove this post?</p>
                  <p className="text-danger">This will permanently delete the post from the system.</p>
                </>
              )}
              <div className="alert alert-secondary">
                {selectedReport?.post?.content 
                  ? (selectedReport.post.content.length > 100
                    ? selectedReport.post.content.substring(0, 100) + '...'
                    : selectedReport.post.content)
                  : 'Content not available'}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={cancelAction}>
                Cancel
              </Button>
              <Button 
                variant={actionType === 'dismiss' ? 'primary' : 'danger'} 
                onClick={confirmAction}
              >
                {actionType === 'dismiss' ? 'Dismiss' : 'Remove'}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ReportedPosts;
