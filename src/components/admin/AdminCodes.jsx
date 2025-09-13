import { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import Sidebar from '../Sidebar';
import {
    generateAdminCode,
    getAdminCodes,
    deleteAdminCode,
    cleanupExpiredCodes
} from '../../firebase/services';

const AdminCodes = () => {
    const [codes, setCodes] = useState([]);
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

    useEffect(() => {
        fetchAdminCodes();

        // Clean up expired codes on component mount
        cleanupExpiredCodes().catch(err => {
            console.error('Failed to cleanup expired codes on mount:', err);
        });
    }, []); const fetchAdminCodes = async () => {
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

    const handleDeleteCode = async (codeId) => {
        if (!window.confirm('Are you sure you want to delete this admin code?')) {
            return;
        }

        try {
            await deleteAdminCode(codeId);
            setSuccess('Admin code deleted successfully');
            fetchAdminCodes();
        } catch (err) {
            console.error('Error deleting code:', err);
            setError('Failed to delete admin code');
        }
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
            return <Badge bg="secondary">Used</Badge>;
        } else if (now > expiresAt) {
            return <Badge bg="danger">Expired</Badge>;
        } else {
            return <Badge bg="success">Active</Badge>;
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
            <div className="main-content">
                <Container fluid className="py-3">
                    <div className="d-flex align-items-center mb-4">
                        <i className="bi bi-key fs-2 text-primary me-2"></i>
                        <h1 className="mb-0">Admin Code Management</h1>
                    </div>

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

                                <div className="text-muted">
                                    Total: {codes.length} codes
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
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
                                            {codes.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-5">
                                                        <div>
                                                            <i className="bi bi-key display-4 text-muted mb-3"></i>
                                                            <div className="text-muted">No admin codes found</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                codes.map((code) => (
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
                                                                {code.isOneTime ? 'One-time' : 'Reusable'}
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
                                                            {code.isUsed ? (
                                                                <small className="text-muted">
                                                                    {code.usedAt ?
                                                                        new Date(code.usedAt).toLocaleDateString() :
                                                                        'Yes'
                                                                    }
                                                                </small>
                                                            ) : (
                                                                <span className="text-muted">No</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleDeleteCode(code.id)}
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
        </div>
    );
};

export default AdminCodes;