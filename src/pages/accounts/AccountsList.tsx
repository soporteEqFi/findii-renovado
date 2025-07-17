import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getAccounts } from '../../services/accounts';
import { Account } from '../../types';

const AccountsList: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const columns = [
    {
      header: 'Account Name',
      accessor: 'name',
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Type',
      accessor: 'type',
      className: 'capitalize',
    },
    {
      header: 'Balance',
      accessor: (account: Account) => (
        <span className="font-medium">
          ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (account: Account) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          account.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : account.status === 'inactive'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {account.status === 'active' ? (
            <>
              <Check size={12} className="mr-1" />
              Active
            </>
          ) : account.status === 'inactive' ? (
            <>
              <X size={12} className="mr-1" />
              Inactive
            </>
          ) : (
            <>Pending</>
          )}
        </span>
      ),
    },
    {
      header: 'Last Activity',
      accessor: (account: Account) => (
        <span>{new Date(account.lastActivity).toLocaleDateString()}</span>
      ),
    },
  ];

  const handleRowClick = (account: Account) => {
    navigate(`/accounts/${account.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your accounts in one place
          </p>
        </div>
        <Button variant="primary">New Account</Button>
      </div>
      
      <Card>
        <Table
          data={accounts}
          columns={columns}
          keyExtractor={(account) => account.id}
          onRowClick={handleRowClick}
          isLoading={isLoading}
          emptyMessage="No accounts found"
        />
      </Card>
    </div>
  );
};

export default AccountsList;