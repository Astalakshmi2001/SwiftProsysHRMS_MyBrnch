import { useEffect, useState } from 'react';
import { API_URL } from '../constant/api';

const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${API_URL}/api/employees`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const data = await response.json();

        // Remove password field from each employee object
        const sanitizedData = data.map(({ password, ...rest }) => rest);

        setEmployees(sanitizedData);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return { employees, loading, error };
};

export default useEmployees;