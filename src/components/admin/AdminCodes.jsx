import { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import { useSidebar } from '../../hooks/useSidebar';
import {
    generateAdminCode,
    getAdminCodes,
    deleteAdminCode,
    cleanupExpiredCodes,
    convertTimestamp
} from '../../firebase/services';

const AdminCodes = () => {
    const { toggleSidebar, isCollapsed } = useSidebar();
    const [codes, setCodes] = useState([]);
    const [filteredCodes, setFilteredCodes] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, expired, used
    const [typeFilter, setTypeFilter] = useState('all'); // all, one-time, reusable
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [newCodeData, setNewCodeData] = useState({
        expiresInHours: 24,
        isOneTime: true
    });
    const [generatedCode, setGeneratedCode] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [codeToDelete, setCodeToDelete] = useState(null);

    useEffect(() => {
        fetchAdminCodes();

        // Clean up expired codes on component mount
        cleanupExpiredCodes().catch(err => {
            console.error('Failed to cleanup expired codes on mount:', err);
        });
    }, []);

    // Filter codes based on status, type, and search
    useEffect(() => {
        let filtered = [...codes];

        // Status filter
        if (statusFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(code => {
                const expiresAt = convertTimestamp(code.expiresAt);
                const isExpired = expiresAt && expiresAt < now;

                if (statusFilter === 'active') {
                    return !isExpired && !code.isUsed;
                } else if (statusFilter === 'expired') {
                    return isExpired;
                } else if (statusFilter === 'used') {
                    return code.isUsed;
                }
                return true;
            });
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(code => {
                if (typeFilter === 'one-time') {
                    return code.isOneTime === true;
                } else if (typeFilter === 'reusable') {
                    return code.isOneTime === false;
                }
                return true;
            });
        }

        // Search filter - search by code value and UID
        if (searchTerm) {
            filtered = filtered.filter(code =>
                code.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                code.id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCodes(filtered);
    }, [codes, statusFilter, typeFilter, searchTerm]);

    // Auto-dismiss success messages after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]); const fetchAdminCodes = async () => {
        try {
            setLoading(true);
            const codesData = await getAdminCodes();
            setCodes(codesData);
        } catch (err) {
            console.error('Error fetching admin codes:', err);
            setError('Failed to load admin codes');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCode = async () => {
        try {
            setGenerating(true);
            setError(null);

            const code = await generateAdminCode(
                'Super Admin', // In real app, use actual admin info
                parseInt(newCodeData.expiresInHours),
                newCodeData.isOneTime
            );

            setGeneratedCode(code);
            setSuccess(`New admin code generated: ${code.code}`);
            fetchAdminCodes(); // Refresh the list

        } catch (err) {
            console.error('Error generating code:', err);
            setError('Failed to generate admin code');
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteClick = (code) => {
        setCodeToDelete(code);
        setShowConfirmDelete(true);
    };

    const confirmDelete = async () => {
        if (!codeToDelete || !codeToDelete.id) {
            console.error("No code selected for deletion");
            setError("Failed to delete code: No code selected");
            setShowConfirmDelete(false);
            setCodeToDelete(null);
            return;
        }

        console.log("Attempting to delete code:", codeToDelete.id);

        try {
            await deleteAdminCode(codeToDelete.id);
            console.log("Code successfully deleted:", codeToDelete.id);
            setSuccess('Admin code deleted successfully');
            fetchAdminCodes();
        } catch (err) {
            console.error("Error deleting code:", err);
            setError(`Failed to delete admin code: ${err.message || "Unknown error"}`);
        } finally {
            setShowConfirmDelete(false);
            setCodeToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowConfirmDelete(false);
        setCodeToDelete(null);
    };

    const handleCleanupExpired = async () => {
        try {
            const deletedCount = await cleanupExpiredCodes();
            setSuccess(`Cleaned up ${deletedCount} expired codes`);
            fetchAdminCodes();
        } catch (err) {
            console.error('Error cleaning up codes:', err);
            setError('Failed to cleanup expired codes');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccess('Code copied to clipboard!');
    };

    const getStatusBadge = (code) => {
        const now = new Date();
        const expiresAt = new Date(code.expiresAt);

        if (code.isUsed) {
            return (
                <Badge bg="secondary">
                    <i className="bi bi-check-circle me-1"></i>
                    USED
                </Badge>
            );
        } else if (now > expiresAt) {
            return (
                <Badge bg="danger">
                    <i className="bi bi-x-circle me-1"></i>
                    EXPIRED
                </Badge>
            );
        } else {
            return (
                <Badge bg="success">
                    <i className="bi bi-check-circle me-1"></i>
                    ACTIVE
                </Badge>
            );
        }
    };

    const formatTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires - now;

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    return (
        <div className="admin-container">
            <Sidebar />
            <button className="mobile-menu-toggle d-lg-none" onClick={toggleSidebar} aria-label="Toggle navigation menu">
                <i className="bi bi-list fs-4"></i>
            </button>
            <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                <Container fluid className="py-3">
                    <div className="d-flex align-items-center mb-4">
                        <h1 className="mb-0">Admin Code Management</h1>
                    </div>

                    {/* Critical Security Warning */}
                    <Alert variant="danger" className="border-danger shadow-sm mb-4">
                        <div className="d-flex align-items-start">
                            <i className="bi bi-shield-exclamation fs-2 me-3 text-danger"></i>
                            <div>
                                <h5 className="alert-heading mb-2">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Critical Security Warning
                                </h5>
                                <p className="mb-2">
                                    <strong>ALWAYS save your admin codes in a secure location!</strong> Without saved codes, unauthorized users can reset browser data and use the bootstrap code (<code>ADMINTEMP</code>) to regain access to the admin panel.
                                </p>
                                <ul className="mb-0 ps-3">
                                    <li>Generate at least one long-term reusable code and store it securely</li>
                                    <li>Never share admin codes with unauthorized personnel</li>
                                    <li>Regularly review and cleanup expired/unused codes</li>
                                    <li>The bootstrap code only works once per browser session but resets on data clear</li>
                                </ul>
                            </div>
                        </div>
                    </Alert>

                    {error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                            {success}
                        </Alert>
                    )}

                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowGenerateModal(true)}
                                    >
                                        <i className="bi bi-plus-circle me-1"></i>
                                        Generate New Code
                                    </Button>
                                    <Button
                                        variant="outline-warning"
                                        onClick={handleCleanupExpired}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Cleanup Expired
                                    </Button>
                                </div>
                            </div>

                            {/* Filter Section - Updated to match other pages */}
                            <div className="d-flex gap-2 mb-3 align-items-end flex-wrap">
                                <div style={{ minWidth: '150px' }}>
                                    <Form.Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        aria-label="Filter admin codes by status"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="expired">Expired</option>
                                        <option value="used">Used</option>
                                    </Form.Select>
                                </div>
                                <div style={{ minWidth: '150px' }}>
                                    <Form.Select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        aria-label="Filter admin codes by type"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="one-time">One-Time</option>
                                        <option value="reusable">Reusable</option>
                                    </Form.Select>
                                </div>
                                <div className="flex-grow-4" style={{ minWidth: '200px' }}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search admin codes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        aria-label="Search admin codes"
                                    />
                                </div>
                            </div>

                            <div className="mb-3 text-muted">
                                Showing <strong>{filteredCodes.length}</strong> of <strong>{codes.length}</strong> codes
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <Table hover className="mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Code</th>
                                                    <th>Status</th>
                                                    <th>Type</th>
                                                    <th>Generated</th>
                                                    <th>Expires</th>
                                                    <th>Time Remaining</th>
                                                    <th>Used</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCodes.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" className="text-center py-5">
                                                            <div>
                                                                <i className="bi bi-key display-4 text-muted mb-3"></i>
                                                                <div className="text-muted">
                                                                    {codes.length === 0 ? 'No admin codes found' : 'No codes match the current filters'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredCodes.map((code) => (
                                                        <tr key={code.id}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <code className="me-2">{code.code}</code>
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        size="sm"
                                                                        onClick={() => copyToClipboard(code.code)}
                                                                        title="Copy to clipboard"
                                                                    >
                                                                        <i className="bi bi-clipboard"></i>
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                            <td>{getStatusBadge(code)}</td>
                                                            <td>
                                                                <Badge bg={code.isOneTime ? 'info' : 'warning'}>
                                                                    <i className={`bi ${code.isOneTime ? 'bi-1-circle' : 'bi-arrow-repeat'} me-1`}></i>
                                                                    {code.isOneTime ? 'ONE-TIME' : 'REUSABLE'}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {code.generatedAt ?
                                                                        new Date(code.generatedAt).toLocaleDateString() :
                                                                        'Unknown'
                                                                    }
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {code.expiresAt ?
                                                                        new Date(code.expiresAt).toLocaleDateString() :
                                                                        'Never'
                                                                    }
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {code.expiresAt ? formatTimeRemaining(code.expiresAt) : 'Never'}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                {code.isOneTime ? (
                                                                    // One-time code: show if used
                                                                    code.isUsed ? (
                                                                        <small className="text-muted">
                                                                            {code.usedAt ?
                                                                                convertTimestamp(code.usedAt)?.toLocaleDateString() || 'Yes' :
                                                                                'Yes'
                                                                            }
                                                                        </small>
                                                                    ) : (
                                                                        <span className="text-muted">No</span>
                                                                    )
                                                                ) : (
                                                                    // Reusable code: show use count and last used
                                                                    code.useCount > 0 ? (
                                                                        <small className="text-muted">
                                                                            {code.useCount}x
                                                                            {code.lastUsedAt && (
                                                                                <> ({convertTimestamp(code.lastUsedAt)?.toLocaleDateString()})</>
                                                                            )}
                                                                        </small>
                                                                    ) : (
                                                                        <span className="text-muted">No</span>
                                                                    )
                                                                )}
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteClick(code)}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                        <small className="text-muted">
                                            Showing {filteredCodes.length} of {codes.length} admin codes
                                        </small>
                                        <div className="d-flex gap-3">
                                            <small className="text-muted">
                                                <Badge bg="success" className="me-1">{codes.filter(c => !c.isUsed && new Date(c.expiresAt) > new Date()).length}</Badge>
                                                Active
                                            </small>
                                            <small className="text-muted">
                                                <Badge bg="warning" className="me-1">{codes.filter(c => c.isUsed && c.isOneTime).length}</Badge>
                                                Used
                                            </small>
                                            <small className="text-muted">
                                                <Badge bg="danger" className="me-1">{codes.filter(c => !c.isUsed && new Date(c.expiresAt) <= new Date()).length}</Badge>
                                                Expired
                                            </small>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            </div>

            {/* Generate Code Modal */}
            <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Generate New Admin Code</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Expires In (Hours)</Form.Label>
                            <Form.Select
                                value={newCodeData.expiresInHours}
                                onChange={(e) => setNewCodeData({
                                    ...newCodeData,
                                    expiresInHours: e.target.value
                                })}
                            >
                                <option value="1">1 Hour</option>
                                <option value="6">6 Hours</option>
                                <option value="12">12 Hours</option>
                                <option value="24">24 Hours (1 Day)</option>
                                <option value="72">72 Hours (3 Days)</option>
                                <option value="168">168 Hours (1 Week)</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="One-time use only"
                                checked={newCodeData.isOneTime}
                                onChange={(e) => setNewCodeData({
                                    ...newCodeData,
                                    isOneTime: e.target.checked
                                })}
                            />
                            <Form.Text className="text-muted">
                                If checked, the code becomes invalid after first use
                            </Form.Text>
                        </Form.Group>
                    </Form>

                    {generatedCode && (
                        <Alert variant="success" className="mt-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <strong>New Code Generated:</strong>
                                    <br />
                                    <code className="fs-5">{generatedCode.code}</code>
                                </div>
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => copyToClipboard(generatedCode.code)}
                                >
                                    <i className="bi bi-clipboard"></i>
                                </Button>
                            </div>
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleGenerateCode}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-key me-1"></i>
                                Generate Code
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete confirmation modal */}
            <Modal
                show={showConfirmDelete}
                onHide={cancelDelete}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this admin code?</p>
                    <div className="alert alert-secondary">
                        <code className="fs-5">{codeToDelete?.code}</code>
                        <br />
                        <small className="text-muted">
                            Type: {codeToDelete?.isOneTime ? 'One-time' : 'Reusable'}
                        </small>
                    </div>
                    <p className="text-danger">This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelDelete}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete Code
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminCodes;