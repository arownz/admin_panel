import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const LoadingBar = () => {
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    if (!loading) return null;

    return <div className="route-loading-bar"></div>;
};

export default LoadingBar;
