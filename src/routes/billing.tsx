import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import {
  DollarSign,
  Download,
  FileText,
  Home,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { searchBills } from '@/routes/api/bills';
import { getAllPatientsWithBills } from '@/routes/api/patient-with-bills';

export const Route = createFileRoute('/billing')({
  component: BillingReports,
});

function BillingReports() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [paidBills, setPaidBills] = useState<any[]>([]);
  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending'>('all');

  const getPatientsFn = useServerFn(getAllPatientsWithBills);
  const searchBillsFn = useServerFn(searchBills);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate({ to: '/login' });
      return;
    }

    const user = JSON.parse(storedUser);
    setCurrentUser(user);
    loadBills();
  }, [navigate]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const result = await getPatientsFn();
      const patientsWithBills = result.patients.filter((p: any) => p.bill);
      const paid = patientsWithBills.filter((p: any) => p.bill.isPaid);
      const pending = patientsWithBills.filter((p: any) => !p.bill.isPaid);
      
      setAllPatients(patientsWithBills);
      setPaidBills(paid);
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

  const handleViewBill = (patientId: number) => {
    navigate({ to: `/bill/${patientId}` });
  };

  const handleViewReport = (patientId: number) => {
    navigate({ to: `/report/${patientId}` });
  };

  if (!currentUser) {
    return null;
  }

  const getDisplayPatients = () => {
    if (showResults) return searchResults.map(r => ({
      ...allPatients.find(p => p.id === r.patientDbId),
      bill: { ...r }
    }));
    
    switch (activeTab) {
      case 'paid': return paidBills;
      case 'pending': return pendingBills;
      default: return allPatients;
    }
  };

  const displayPatients = getDisplayPatients();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-linear-to-br from-cyan-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing & Reports</h1>
              <p className="text-sm text-gray-600">
                {currentUser.labInfo?.labName || 'Lab Management System'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.fullName}
              </p>
              <p className="text-xs text-gray-600">{currentUser.role}</p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Home className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Component */}
        <Card className="shadow-xl border-2 border-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Search Bills</h3>
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
                <p className="text-sm text-gray-600 mb-3">
                  Found {searchResults.length} bill(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bills</p>
                  <p className="text-3xl font-bold text-gray-900">{allPatients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paid Bills</p>
                  <p className="text-3xl font-bold text-gray-900">{paidBills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-orange-600 to-red-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Bills</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingBills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        {!showResults && (
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setActiveTab('all')}
              className={activeTab === 'all' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'}
            >
              All Bills ({allPatients.length})
            </Button>
            <Button
              onClick={() => setActiveTab('paid')}
              className={activeTab === 'paid' ? 'bg-green-600' : 'bg-gray-200 text-gray-700'}
            >
              Paid ({paidBills.length})
            </Button>
            <Button
              onClick={() => setActiveTab('pending')}
              className={activeTab === 'pending' ? 'bg-orange-600' : 'bg-gray-200 text-gray-700'}
            >
              Pending ({pendingBills.length})
            </Button>
          </div>
        )}

        {/* Bills List */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {showResults ? 'Search Results' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bills`}
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading bills...</p>
            </div>
          ) : displayPatients.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {showResults ? 'No bills found matching your search' : 'No bills available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayPatients.map((patient: any) => (
                <Card
                  key={patient.id}
                  className="shadow-lg hover:shadow-2xl transition-all border-0"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">
                          {patient.fullName}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Patient ID</p>
                            <p className="font-semibold text-gray-900">
                              {patient.patientId}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Invoice</p>
                            <p className="font-semibold text-blue-600">
                              {patient.bill?.invoiceNumber || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Amount</p>
                            <p className="font-semibold text-gray-900">
                              ₹{patient.bill?.finalAmount || '0.00'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                              patient.bill?.isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {patient.bill?.isPaid ? '✓ Paid' : 'Pending'}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-500">Phone</p>
                            <p className="font-semibold text-gray-900">
                              {patient.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewBill(patient.id)}
                          className="bg-linear-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600 gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          View Bill
                        </Button>
                        {patient.bill?.isPaid && (
                          <Button
                            onClick={() => handleViewReport(patient.id)}
                            className="bg-linear-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}