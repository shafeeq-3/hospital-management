import { useState, useEffect } from 'react';
import { CreditCard, Download, Eye } from 'lucide-react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  useEffect(() => {
    fetchBills();
  }, [currentPage]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patient/billings?page=${currentPage}&limit=10`);
      setBills(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!cardDetails.cardNumber || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
      toast.error('Please fill all card details');
      return;
    }

    setPaymentLoading(true);
    try {
      await api.post('/payments/create', {
        billingId: selectedBill._id,
        amount: selectedBill.dueAmount,
        paymentMethod: 'card',
        cardDetails: {
          last4: cardDetails.cardNumber.slice(-4),
          brand: 'Visa',
          expiryMonth: parseInt(cardDetails.expiryMonth),
          expiryYear: parseInt(cardDetails.expiryYear),
        },
      });

      toast.success('Payment successful!');
      setShowPaymentModal(false);
      setCardDetails({ cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' });
      fetchBills();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600 mt-1">View and manage your bills</p>
        </div>
      </div>

      {bills.length === 0 ? (
        <Card>
          <EmptyState
            icon={CreditCard}
            title="No bills found"
            description="You don't have any bills at the moment"
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {bills.map((bill) => (
              <Card key={bill._id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{bill.billId}</h3>
                      <Badge className={getStatusColor(bill.paymentStatus)}>
                        {bill.paymentStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Bill Date:</span>
                        <span className="ml-2 font-medium">{formatDate(bill.billDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Due Date:</span>
                        <span className="ml-2 font-medium">{formatDate(bill.dueDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="ml-2 font-medium">{formatCurrency(bill.totalAmount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Due Amount:</span>
                        <span className="ml-2 font-medium text-red-600">{formatCurrency(bill.dueAmount)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 mb-2">Items:</p>
                      <div className="space-y-1">
                        {bill.items?.map((item, idx) => (
                          <div key={idx} className="text-sm flex justify-between">
                            <span>{item.description} (x{item.quantity})</span>
                            <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-32">
                    {bill.paymentStatus !== 'paid' && (
                      <Button
                        onClick={() => handlePayNow(bill)}
                        className="w-full"
                        size="sm"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
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

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Process Payment"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Bill ID:</span>
              <span className="font-medium">{selectedBill?.billId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount to Pay:</span>
              <span className="font-bold text-lg">{formatCurrency(selectedBill?.dueAmount)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength="16"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <input
                  type="text"
                  placeholder="MM"
                  maxLength="2"
                  value={cardDetails.expiryMonth}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiryMonth: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  placeholder="YYYY"
                  maxLength="4"
                  value={cardDetails.expiryYear}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiryYear: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  maxLength="3"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
              disabled={paymentLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={processPayment}
              className="flex-1"
              disabled={paymentLoading}
            >
              {paymentLoading ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Billing;
