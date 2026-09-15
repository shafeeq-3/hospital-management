import { useState, useEffect } from 'react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const DoctorSalary = () => {
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/doctor/salary');
      setSalaryData(data.data);
    } catch (error) {
      console.error('Error fetching salaries:', error);
      toast.error('Failed to fetch salary information');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const totalPaid = salaryData?.salaryHistory?.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + s.netSalary, 0) || 0;
  const totalPending = salaryData?.salaryHistory?.filter(s => s.paymentStatus === 'pending').reduce((sum, s) => sum + s.netSalary, 0) || 0;

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Salary</h1>
          <p className="text-gray-600 mt-1">View your salary details and payment history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Base Salary</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(salaryData?.baseSalary || 0)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        {!salaryData?.salaryHistory || salaryData.salaryHistory.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No payment history"
            description="Your salary payment history will appear here"
          />
        ) : (
          <div className="space-y-4">
            {salaryData.salaryHistory.map((salary) => (
              <div
                key={salary._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {getMonthName(salary.month)} {salary.year}
                      </h4>
                      <Badge className={getStatusColor(salary.paymentStatus)}>
                        {salary.paymentStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Base:</span>
                        <span className="ml-1 font-medium">{formatCurrency(salary.baseSalary)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Allowances:</span>
                        <span className="ml-1 font-medium text-green-600">
                          +{formatCurrency(salary.allowances)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bonuses:</span>
                        <span className="ml-1 font-medium text-green-600">
                          +{formatCurrency(salary.bonuses)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Deductions:</span>
                        <span className="ml-1 font-medium text-red-600">
                          -{formatCurrency(salary.deductions)}
                        </span>
                      </div>
                    </div>

                    {salary.paymentDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Paid on: {new Date(salary.paymentDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600">Net Salary</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(salary.netSalary)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DoctorSalary;
