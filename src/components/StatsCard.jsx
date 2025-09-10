import { Card } from 'react-bootstrap';const StatsCard = ({ title, value, icon, bgColor, iconBg }) => {  return (    <Card className={`border-0 ${bgColor} text-white h-100`}>      <Card.Body className="d-flex align-items-center justify-content-between p-4">        <div>          <h2 className="mb-1 fw-bold">{value}</h2>          <div className="small opacity-90">{title}</div>        </div>        <div           className={`rounded-circle d-flex align-items-center justify-content-center ${iconBg}`}          style={{ width: '60px', height: '60px' }}        >          <i className={`${icon} fs-4`}></i>        </div>      </Card.Body>
    </Card>
  );
};

export default StatsCard;