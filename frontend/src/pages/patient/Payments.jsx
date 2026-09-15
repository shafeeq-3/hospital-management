import { useState, useEffect } from 'react';
import { CreditCard, Download } from 'lucide-react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patient/payments?page=${currentPage}&limit=10`);
      setPayments(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-1">View all your payment transactions</p>
      </div>

      {payments.length === 0 ? (
        <Card>
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description="You haven't made any payments yet"
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {payments.map((payment) => (
              <Card key={payment._id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{payment.paymentId}</h3>
                      <Badge className={getStatusColor(payment.paymentStatus)}>
                        {payment.paymentStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="ml-2 font-mono text-xs">{payment.transactionId}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment Date:</span>
                        <span className="ml-2 font-medium">{formatDate(payment.paymentDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="ml-2 font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Method:</span>
                        <span className="ml-2 font-medium capitalize">{payment.paymentMethod}</span>
                      </div>
                    </div>

                    {payment.cardDetails && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {payment.cardDetails.brand} ending in {payment.cardDetails.last4}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Receipt</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Payments;
