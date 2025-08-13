import { useState, useEffect } from 'react';
import { COLOMBIA_CITIES_API } from '../config/constants';
import { departments as localDepartments, getCitiesByDepartment as getLocalCities } from '../data/colombianCities';

interface City {
  municipio: string;
  departamento: string;
}

export const useCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(COLOMBIA_CITIES_API);
        if (!response.ok) {
          throw new Error('Error al cargar las ciudades');
        }

        const data: City[] = await response.json();

        // Ordenar ciudades alfabéticamente
        const sortedCities = data.sort((a, b) =>
          a.municipio.localeCompare(b.municipio, 'es', { sensitivity: 'base' })
        );

        setCities(sortedCities);

        // Extraer departamentos únicos y ordenarlos
        const uniqueDepartments = [...new Set(data.map(city => city.departamento))]
          .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

        setDepartments(uniqueDepartments);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('No se pudieron cargar las ciudades');
        // Usar datos locales como respaldo
        setDepartments(localDepartments);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const getCitiesByDepartment = (department: string): City[] => {
    if (cities.length > 0) {
      return cities.filter(city => city.departamento === department);
    } else {
      // Usar datos locales como respaldo
      const localCities = getLocalCities(department);
      return localCities.map(city => ({
        municipio: city,
        departamento: department
      }));
    }
  };

  return {
    cities,
    departments,
    loading,
    error,
    getCitiesByDepartment
  };
};
