import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Clock, Tag, Activity } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getAccountById } from '../../services/accounts';
import { Account } from '../../types';

const AccountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await getAccountById(id);
        setAccount(data);
      } catch (error) {
        console.error('Error fetching account details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccount();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Account not found</h2>
        <p className="mt-2 text-gray-500">The account you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-4" onClick={() => navigate('/accounts')}>
          Back to Accounts
        </Button>
      </div>
    );
  }

  const accountStatusColor = account.status === 'active' 
    ? 'bg-green-100 text-green-800' 
    : account.status === 'inactive'
    ? 'bg-red-100 text-red-800'
    : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/accounts')}
          className="mr-4"
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{account.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Account details and information
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Account Details">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CreditCard size={16} className="mr-1" /> Account Type
                </dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{account.type}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Clock size={16} className="mr-1" /> Last Activity
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(account.lastActivity).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Tag size={16} className="mr-1" /> Status
                </dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accountStatusColor}`}>
                    {account.status}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Activity size={16} className="mr-1" /> Account ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{account.id}</dd>
              </div>
            </dl>
          </Card>
          
          <Card className="mt-6" title="Transaction History">
            <p className="text-sm text-gray-500">
              This is a demo account. Transaction history is not available.
            </p>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Monthly Service Fee</p>
                  <p className="text-xs text-gray-500">May 1, 2023</p>
                </div>
                <p className="text-sm font-medium text-red-600">-$10.00</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Deposit</p>
                  <p className="text-xs text-gray-500">Apr 28, 2023</p>
                </div>
                <p className="text-sm font-medium text-green-600">+$1,250.00</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Withdrawal</p>
                  <p className="text-xs text-gray-500">Apr 15, 2023</p>
                </div>
                <p className="text-sm font-medium text-red-600">-$500.00</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card title="Account Balance">
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-6 space-y-3">
                <Button variant="primary" className="w-full">Deposit Funds</Button>
                <Button variant="outline" className="w-full">Withdraw</Button>
              </div>
            </div>
          </Card>
          
          <Card className="mt-6" title="Account Actions">
            <div className="space-y-3">
              <Button variant="outline" className="w-full" size="sm">Download Statement</Button>
              <Button variant="outline" className="w-full" size="sm">Update Information</Button>
              {account.status === 'active' ? (
                <Button variant="outline" className="w-full" size="sm">Freeze Account</Button>
              ) : (
                <Button variant="outline" className="w-full" size="sm">Activate Account</Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;