import React, { useEffect, useState } from 'react';
import { CreditCard, Users, Home, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
import { getAvailableAccounts } from '../services/accounts';
import { getRentals } from '../services/rentals';
import { getClients } from '../services/clients';
import { Account, Rental, Client } from '../types';

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [accountsData, rentalsData, clientsData] = await Promise.all([
          getAvailableAccounts(),
          getRentals(),
          getClients('rev001'), // Using a default revendedor ID
        ]);
        
        setAccounts(accountsData);
        setRentals(rentalsData);
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Stats calculations
  const activeRentals = rentals.filter(rental => rental.status === 'active').length;
  const expiredRentals = rentals.filter(rental => rental.status === 'expired').length;
  const activeClients = clients.filter(client => client.status === 'active').length;
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  const stats = [
    { 
      name: 'Total Balance', 
      value: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
      icon: CreditCard,
      color: 'bg-blue-500',
    },
    { 
      name: 'Active Rentals', 
      value: activeRentals, 
      icon: Home,
      color: 'bg-green-500',
    },
    { 
      name: 'Expired Rentals', 
      value: expiredRentals, 
      icon: AlertTriangle,
      color: 'bg-amber-500',
    },
    { 
      name: 'Active Clients', 
      value: activeClients, 
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your property management dashboard
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Recent Accounts" subtitle="Your most recent active accounts">
          <div className="space-y-4">
            {accounts.slice(0, 3).map((account) => (
              <div key={account.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 rounded-full p-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{account.name}</p>
                  <p className="text-sm text-gray-500">${account.balance.toLocaleString()}</p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {account.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="Recent Rentals" subtitle="Your most recent rental agreements">
          <div className="space-y-4">
            {rentals.slice(0, 3).map((rental) => (
              <div key={rental.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="bg-amber-100 rounded-full p-2">
                  <Home className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{rental.propertyName}</p>
                  <p className="text-sm text-gray-500">${rental.price}/month</p>
                </div>
                <div className="ml-auto">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rental.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rental.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;