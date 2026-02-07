import { useState, useEffect } from 'react';
import PropertyGrid from '../../components/PropertyGrid/PropertyGrid';
import PropertyFilters from '../../components/PropertyFilters/PropertyFilters';
import { DEFAULT_FILTERS } from '../../lib/filterUtil';
import { ApiUtil } from '../../lib/apiUtil';
import './Home.scss';

const Home = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    ApiUtil.getProperties().then((data) => setProperties(data));
  }, []);

  function onFilterChange(partialFilters) {
    const updatedFilters = { ...filters, ...partialFilters };
    setFilters(updatedFilters);
  }

  return (
    <div className="home-page">
      <div className="home-filters">
        <PropertyFilters filters={filters} onFilterChange={onFilterChange} />
      </div>
      <div className="home-content">
        <PropertyGrid properties={properties} filters={filters} />
      </div>
    </div>
  );
};

export default Home;
