import { Card } from 'react-bootstrap';

const Chart = ({ title, type = 'bar' }) => {
  const renderBarChart = () => (
    <div className="mt-4">
      <div className="text-center mb-4">
        <h6 className="text-muted mb-3">Platform Overview</h6>
        <div className="d-flex align-items-center justify-content-center mb-2">
          <div className="bg-primary me-2" style={{ width: '12px', height: '12px', borderRadius: '2px' }}></div>
          <small className="text-muted">Count</small>
        </div>
      </div>

      <div className="d-flex justify-content-around align-items-end" style={{ height: '250px', paddingBottom: '40px' }}>
        <div className="text-center">
          <div
            className="bg-primary mx-auto mb-3"
            style={{ width: '60px', height: '160px', borderRadius: '4px 4px 0 0' }}
          ></div>
          <small className="text-muted">Users</small>
        </div>
        <div className="text-center">
          <div
            className="bg-success mx-auto mb-3"
            style={{ width: '60px', height: '130px', borderRadius: '4px 4px 0 0' }}
          ></div>
          <small className="text-muted">Posts</small>
        </div>
        <div className="text-center">
          <div
            className="bg-warning mx-auto mb-3"
            style={{ width: '60px', height: '60px', borderRadius: '4px 4px 0 0' }}
          ></div>
          <small className="text-muted">Appointments</small>
        </div>
        <div className="text-center">
          <div
            className="bg-danger mx-auto mb-3"
            style={{ width: '60px', height: '50px', borderRadius: '4px 4px 0 0' }}
          ></div>
          <small className="text-muted">Reports</small>
        </div>
        <div className="text-center">
          <div
            className="bg-info mx-auto mb-3"
            style={{ width: '60px', height: '80px', borderRadius: '4px 4px 0 0' }}
          ></div>
          <small className="text-muted">Verifications</small>
        </div>
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="mt-4">
      <div className="d-flex justify-content-center align-items-center mb-4" style={{ height: '200px' }}>
        <div
          className="rounded-circle position-relative"
          style={{
            width: '180px',
            height: '180px',
            background: 'conic-gradient(#20c997 0deg 126deg, #6f42c1 126deg 216deg, #ffc107 216deg 270deg, #dc3545 270deg 360deg)'
          }}
        >
          <div
            className="bg-white rounded-circle position-absolute top-50 start-50 translate-middle"
            style={{ width: '90px', height: '90px' }}
          ></div>
        </div>
      </div>

      <div className="row g-2">
        <div className="col-6 text-center">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <div className="bg-success me-2" style={{ width: '12px', height: '12px', borderRadius: '2px' }}></div>
            <small className="text-muted">Active Users</small>
          </div>
        </div>
        <div className="col-6 text-center">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <div className="bg-primary me-2" style={{ width: '12px', height: '12px', borderRadius: '2px' }}></div>
            <small className="text-muted">Published Posts</small>
          </div>
        </div>
        <div className="col-6 text-center">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <div className="bg-warning me-2" style={{ width: '12px', height: '12px', borderRadius: '2px' }}></div>
            <small className="text-muted">Pending Verifications</small>
          </div>
        </div>
        <div className="col-6 text-center">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <div className="bg-danger me-2" style={{ width: '12px', height: '12px', borderRadius: '2px' }}></div>
            <small className="text-muted">Unresolved Reports</small>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="p-4">
        <h5 className="card-title mb-0 d-flex align-items-center">
          <i className={`bi bi-${type === 'pie' ? 'pie-chart' : 'bar-chart'} me-2`}></i>
          {title}
        </h5>
        {type === 'pie' ? renderPieChart() : renderBarChart()}
      </Card.Body>
    </Card>
  );
};

export default Chart;