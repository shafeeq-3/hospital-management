import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Salary = () => {
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalaryData();
  }, []);

  const fetchSalaryData = async () => {
    try {
      const response = await api.get('/staff/salary');
      setSalaryData(response.data.data);
    } catch (error) {
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

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Salary Information</h1>
        <p className="text-gray-600 mt-1">View your salary details and payment history</p>
      </div>

      {/* Current Salary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Base Salary</h3>
        <div className="text-center py-6">
          <p className="text-4xl font-bold text-green-600">
            {formatCurrency(salaryData?.baseSalary || 0)}
          </p>
          <p className="text-gray-600 mt-2">Per Month</p>
        </div>
      </Card>

      {/* Salary History */}
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
                        Paid on: {formatDate(salary.paymentDate)}
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

export default Salary;
