import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, CheckCircle2, Home, ListChecks, Plus, Settings, Stethoscope, TestTube } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createDoctor, getAllDoctors } from '@/routes/api/doctors';
import { createTestParameter } from '@/routes/api/test-parameters';
import { getTestParametersByTestId } from '@/routes/api/test-parameters-by-id';
import { createTest, getAllTests } from '@/routes/api/tests';

export const Route = createFileRoute('/setup')({
  component: Setup,
});

function Setup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'doctors' | 'tests' | 'parameters'>('doctors');

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Setup</h1>
              <p className="text-gray-600">Configure doctors, tests, and parameters</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate({ to: '/' })} 
            variant="outline"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Tabs */}
          <div className="bg-linear-to-r from-green-600 to-emerald-500 p-2">
            <div className="flex gap-2">
              <Button
                onClick={() => setActiveTab('doctors')}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'doctors'
                    ? 'bg-white text-green-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Doctors
                </div>
              </Button>
              <Button
                onClick={() => setActiveTab('tests')}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'tests'
                    ? 'bg-white text-green-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Tests
                </div>
              </Button>
              <Button
                onClick={() => setActiveTab('parameters')}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'parameters'
                    ? 'bg-white text-green-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ListChecks className="w-5 h-5" />
                  Test Parameters
                </div>
              </Button>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-8">
            {activeTab === 'doctors' && <DoctorsTab />}
            {activeTab === 'tests' && <TestsTab />}
            {activeTab === 'parameters' && <ParametersTab />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Doctors Tab Component
function DoctorsTab() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createDoctorFn = useServerFn(createDoctor);
  const getDoctorsFn = useServerFn(getAllDoctors);

  const doctorSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    specialization: z.string().optional(),
    contactNumber: z.string().optional(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(doctorSchema),
  });

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const result = await getDoctorsFn();
      setDoctors(result.doctors || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      setSuccess(false);
      await createDoctorFn({ data });
      setSuccess(true);
      reset();
      await loadDoctors();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating doctor:', err);
      setError(err instanceof Error ? err.message : 'Failed to create doctor');
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="border-green-300 bg-green-50 shadow-md">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 ml-2">
            <strong>Success!</strong> Doctor added successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-300 bg-red-50 shadow-md">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 ml-2">{error}</AlertDescription>
        </Alert>
      )}

      {/* Add New Doctor Form */}
      <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          Add New Doctor
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 font-medium">
                Doctor Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                {...register('name')} 
                placeholder="Dr. John Smith" 
                className="bg-white"
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-gray-900 font-medium">
                Specialization
              </Label>
              <Input 
                {...register('specialization')} 
                placeholder="e.g., Cardiologist" 
                className="bg-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactNumber" className="text-gray-900 font-medium">
              Contact Number
            </Label>
            <Input 
              {...register('contactNumber')} 
              placeholder="9876543210" 
              className="bg-white"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding Doctor...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Doctor
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Registered Doctors List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          Registered Doctors ({doctors.length})
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No doctors registered yet</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-blue-50 to-cyan-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Specialization</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Contact</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor: any, index: number) => (
                  <tr key={doctor.id} className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{doctor.name}</td>
                    <td className="px-6 py-4 text-gray-700">{doctor.specialization || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{doctor.contactNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Tests Tab Component
function TestsTab() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createTestFn = useServerFn(createTest);
  const getTestsFn = useServerFn(getAllTests);

  const testSchema = z.object({
    name: z.string().min(1, 'Test name is required'),
    description: z.string().optional(),
    price: z.string().min(1, 'Price is required'),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(testSchema),
  });

  const loadTests = async () => {
    try {
      setLoading(true);
      const result = await getTestsFn();
      setTests(result.tests || []);
    } catch (err) {
      console.error('Error loading tests:', err);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      setSuccess(false);
      await createTestFn({ data });
      setSuccess(true);
      reset();
      await loadTests();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating test:', err);
      setError(err instanceof Error ? err.message : 'Failed to create test');
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="border-green-300 bg-green-50 shadow-md">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 ml-2">
            <strong>Success!</strong> Test added successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-300 bg-red-50 shadow-md">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 ml-2">{error}</AlertDescription>
        </Alert>
      )}

      {/* Add New Test Form */}
      <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          Add New Test
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900 font-medium">
              Test Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              {...register('name')} 
              placeholder="e.g., Complete Blood Count (CBC)" 
              className="bg-white"
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name.message as string}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900 font-medium">
              Description
            </Label>
            <Textarea 
              {...register('description')} 
              rows={3} 
              placeholder="Brief description of the test" 
              className="resize-none bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-gray-900 font-medium">
              Price (₹) <span className="text-red-500">*</span>
            </Label>
            <Input 
              {...register('price')} 
              placeholder="500.00" 
              className="bg-white"
            />
            {errors.price && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.price.message as string}
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding Test...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Test
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Available Tests List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TestTube className="w-5 h-5 text-white" />
          </div>
          Available Tests ({tests.length})
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tests configured yet</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-blue-50 to-cyan-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Test Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Price</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test: any, index: number) => (
                  <tr key={test.id} className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{test.name}</td>
                    <td className="px-6 py-4 text-gray-700">{test.description || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">₹{test.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ParametersTab() {
  const [tests, setTests] = useState<any[]>([]);
  const [parameters, setParameters] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getTestsFn = useServerFn(getAllTests);
  const getParametersFn = useServerFn(getTestParametersByTestId);
  const createParameterFn = useServerFn(createTestParameter);

  const parameterSchema = z.object({
    testId: z.number(),
    parameterName: z.string().min(1, 'Parameter name is required'),
    unit: z.string().optional(),
    normalRange: z.string().optional(),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(parameterSchema),
  });

  const loadTests = async () => {
    try {
      setLoading(true);
      const result = await getTestsFn();
      setTests(result.tests || []);
    } catch (err) {
      console.error('Error loading tests:', err);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const loadParameters = async (testId: number) => {
    try {
      const result = await getParametersFn({ data: { testId } });
      setParameters(result.parameters || []);
    } catch (err) {
      console.error('Error loading parameters:', err);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTestId) {
      loadParameters(Number(selectedTestId));
    }
  }, [selectedTestId]);

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      setSuccess(false);
      await createParameterFn({ data });
      setSuccess(true);
      reset({ testId: Number(selectedTestId) });
      setValue('testId', Number(selectedTestId));
      await loadParameters(Number(selectedTestId));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to create parameter');
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="border-green-300 bg-green-50 shadow-md">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 ml-2">
            <strong>Success!</strong> Parameter added successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-300 bg-red-50 shadow-md">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 ml-2">{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Test Parameter Form */}
      <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          Add Test Parameter
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testId" className="text-gray-900 font-medium">
              Select Test <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => {
                setSelectedTestId(value);
                setValue('testId', Number(value));
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Choose a test to add parameters" />
              </SelectTrigger>
              <SelectContent>
                {tests.map((test: any) => (
                  <SelectItem key={test.id} value={test.id.toString()}>
                    {test.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameterName" className="text-gray-900 font-medium">
              Parameter Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              {...register('parameterName')} 
              placeholder="e.g., Hemoglobin" 
              className="bg-white"
            />
            {errors.parameterName && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.parameterName.message as string}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-gray-900 font-medium">Unit</Label>
              <Input 
                {...register('unit')} 
                placeholder="e.g., g/dL" 
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="normalRange" className="text-gray-900 font-medium">Normal Range</Label>
              <Input 
                {...register('normalRange')} 
                placeholder="e.g., 12-16" 
                className="bg-white"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedTestId}
            className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding Parameter...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Parameter
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Parameters List */}
      {selectedTestId && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            Parameters for {tests.find((t: any) => t.id === Number(selectedTestId))?.name} ({parameters.length})
          </h2>
          {parameters.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <ListChecks className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No parameters configured for this test yet</p>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-linear-to-r from-blue-50 to-cyan-50">
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Parameter</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Unit</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Normal Range</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((param: any, index: number) => (
                    <tr key={param.id} className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 font-medium text-gray-900">{param.parameterName}</td>
                      <td className="px-6 py-4 text-gray-700">{param.unit || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{param.normalRange || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}