import React, { useEffect, useState } from 'react';
import { Home, Clock, CheckCircle, XCircle } from 'lucide-react';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getRentals } from '../../services/rentals';
import { Rental } from '../../types';

const RentalsList: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      setIsLoading(true);
      try {
        const data = await getRentals();
        setRentals(data);
      } catch (error) {
        console.error('Error fetching rentals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, []);

  const filteredRentals = activeFilter === 'all' 
    ? rentals
    : rentals.filter(rental => rental.status === activeFilter);

  const columns = [
    {
      header: 'Property',
      accessor: 'propertyName',
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Start Date',
      accessor: (rental: Rental) => (
        <span>{new Date(rental.startDate).toLocaleDateString()}</span>
      ),
    },
    {
      header: 'End Date',
      accessor: (rental: Rental) => (
        <span>{new Date(rental.endDate).toLocaleDateString()}</span>
      ),
    },
    {
      header: 'Price',
      accessor: (rental: Rental) => (
        <span className="font-medium">${rental.price}/month</span>
      ),
    },
    {
      header: 'Status',
      accessor: (rental: Rental) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          rental.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {rental.status === 'active' ? (
            <>
              <CheckCircle size={12} className="mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircle size={12} className="mr-1" />
              Expired
            </>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rentals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your rental properties
          </p>
        </div>
        <Button variant="primary" icon={<Home size={16} />}>New Rental</Button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4">
          <Button 
            variant={activeFilter === 'all' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All Rentals
          </Button>
          <Button 
            variant={activeFilter === 'active' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter('active')}
            icon={<CheckCircle size={16} />}
          >
            Active
          </Button>
          <Button 
            variant={activeFilter === 'expired' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter('expired')}
            icon={<Clock size={16} />}
          >
            Expired
          </Button>
        </div>
      </div>
      
      <Card>
        <Table
          data={filteredRentals}
          columns={columns}
          keyExtractor={(rental) => rental.id}
          isLoading={isLoading}
          emptyMessage={`No ${activeFilter === 'all' ? '' : activeFilter} rentals found`}
        />
      </Card>
    </div>
  );
};

export default RentalsList;