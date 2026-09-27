import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children, scrollContainerRef }) {
  const location = useLocation();

  useEffect(() => {
    // Reset scroll on the .iv-page container when navigating
    if (scrollContainerRef && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname, scrollContainerRef]);

  return (
    <div key={location.pathname} className="iv-page-transition">
      {children}
    </div>
  );
}

export default PageTransition;
