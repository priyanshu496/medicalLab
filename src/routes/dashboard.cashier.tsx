import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import {
  ClipboardList,
  DollarSign,
  FileText,
  LogOut,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { searchBills } from '@/routes/api/bills';
import { getAllPatientsWithBills } from '@/routes/api/patient-with-bills';

export const Route = createFileRoute('/dashboard/cashier')({
  component: CashierDashboard,
});

function CashierDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [paidPatients, setPaidPatients] = useState<any[]>([]);
  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const getPatientsFn = useServerFn(getAllPatientsWithBills);
  const searchBillsFn = useServerFn(searchBills);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate({ to: '/login' });
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== 'cashier') {
      if (user.role === 'master') {
        navigate({ to: '/dashboard/master' });
      } else {
        navigate({ to: '/dashboard/technician' });
      }
      return;
    }

    setCurrentUser(user);
    loadBills();
  }, [navigate]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const result = await getPatientsFn();
      const paid = result.patients.filter((p: any) => p.bill && p.bill.isPaid);
      const pending = result.patients.filter((p: any) => p.bill && !p.bill.isPaid);
      setPaidPatients(paid);
      setPendingBills(pending);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setSearching(true);
      const response = await searchBillsFn({ data: { query: searchQuery.trim() } });
      setSearchResults(response.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate({ to: '/login' });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Component */}
        <Card className="shadow-xl border-2 border-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Quick Search</h3>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by Invoice Number, Patient ID, or Patient Name..."
                  className="pr-10"
                />
                {searchQuery && (
                  <Button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {showResults && (
              <div className="mt-4">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No results found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-3">Found {searchResults.length} result(s)</p>
                    {searchResults.map((result: any) => (
                      <Link
                        key={result.id}
                        to={`/bill/${result.patientDbId}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{result.patientName}</p>
                            <div className="grid grid-cols-3 gap-4 text-sm mt-2">
                              <div>
                                <p className="text-gray-500">Invoice</p>
                                <p className="font-semibold">{result.invoiceNumber}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Amount</p>
                                <p className="font-semibold text-green-600">₹{result.finalAmount}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Status</p>
                                <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                                  result.isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {result.isPaid ? 'Paid' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Bills</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingBills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-cyan-600 to-blue-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paid Bills</p>
                  <p className="text-3xl font-bold text-gray-900">{paidPatients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-orange-600 to-red-500 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{paidPatients.length + pendingBills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Bills Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Pending Bills - Action Required
          </h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : pendingBills.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No pending bills</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingBills.map((patient: any) => (
                <Link
                  key={patient.id}
                  to={`/bill/${patient.id}`}
                  className="block"
                >
                  <Card className="shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900">{patient.fullName}</h4>
                          <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-gray-500">Patient ID</p>
                              <p className="font-semibold">{patient.patientId}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Amount</p>
                              <p className="font-semibold text-red-600">₹{patient.bill.finalAmount}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Phone</p>
                              <p className="font-semibold">{patient.phoneNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Invoice</p>
                              <p className="font-semibold">{patient.bill.invoiceNumber}</p>
                            </div>
                          </div>
                        </div>
                        <Button className="bg-linear-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Process Payment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Paid Bills Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Completed Payments
          </h3>
          {paidPatients.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No completed payments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paidPatients.map((patient: any) => (
                <div
                  key={patient.id}
                  className="p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{patient.fullName}</p>
                    <p className="text-sm text-gray-600">Invoice: {patient.bill.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{patient.bill.finalAmount}</p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      ✓ Paid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}