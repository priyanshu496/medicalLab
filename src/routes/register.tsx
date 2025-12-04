import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, ArrowRight, CheckCircle2, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Header } from '@/components/Header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createPatientSchema } from '@/lib/validation_schemas';
import { getAllDoctors } from '@/routes/api/doctors';
import { createPatient } from '@/routes/api/patients';
import { getAllTests } from '@/routes/api/tests';

export const Route = createFileRoute('/register')({
  component: Register,
});


type PatientFormData = z.infer<typeof createPatientSchema>;

function Register() {
  const navigate = useNavigate();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [generatedPatientId, setGeneratedPatientId] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const createPatientFn = useServerFn(createPatient);
  const getDoctorsFn = useServerFn(getAllDoctors);
  const getTestsFn = useServerFn(getAllTests);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [doctorsResult, testsResult] = await Promise.all([
          getDoctorsFn(),
          getTestsFn(),
        ]);
        setDoctors(doctorsResult.doctors || []);
        setTests(testsResult.tests || []);
      } catch (error) {
        console.error('Error loading data:', error);
        setSubmitError('Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  },);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      state: 'Assam',
      testIds: [],
      patientConsent: false,
    },
  });

  // const selectedTests = watch('testIds') || [];
  const patientConsent = watch('patientConsent');

  // const handleTestToggle = (testId: number) => {
  //   // const currentTests = selectedTests;
  //   const newTests = currentTests.includes(testId)
  //     ? currentTests.filter((t) => t !== testId)
  //     : [...currentTests, testId];
  //   setValue('testIds', newTests);
  // };

  const onSubmit = async (formData: PatientFormData) => {
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      const result = await createPatientFn({ data: formData });

      console.log('Patient saved successfully! ID:', result.patient.patientId);
      setGeneratedPatientId(result.patient.patientId);
      setSubmitSuccess(true);

      setTimeout(() => {
        navigate({ to: `/bill/${result.patient.id}` });
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'An error occurred while saving patient data'
      );
    }
  };

  // const calculateTotal = () => {
  //   return tests
  //     .filter((test) => selectedTests.includes(test.id))
  //     .reduce((sum, test) => sum + Number(test.price), 0);
  // };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-blue-200 rounded-lg w-3/4 mx-auto"></div>
            <p className="text-lg text-gray-600">Loading registration form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-full mx-auto">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-linear-to-r from-blue-600 to-cyan-500 text-white p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">Patient Registration</CardTitle>
                <CardDescription className="text-blue-100 text-base mt-1">
                  Complete patient registration form for medical lab testing
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {submitSuccess && (
              <Alert className="mb-6 border-green-300 bg-green-50 shadow-md">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 ml-2">
                  <strong>Success!</strong> Patient registered successfully!
                  <br />
                  Patient ID: <span className="font-bold">{generatedPatientId}</span>
                  <br />
                  Redirecting to billing...
                </AlertDescription>
              </Alert>
            )}

            {submitError && (
              <Alert className="mb-6 border-red-300 bg-red-50 shadow-md">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 ml-2">{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-blue-200 pb-2">
                  Personal Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-900 font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input {...register('fullName')} placeholder="Enter full name" className="bg-white" />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-900 font-medium">Age<span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      {...register('age', { valueAsNumber: true })}
                      placeholder="25"
                      className="bg-white"
                    />
                    {errors.age && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 font-medium">Gender<span className="text-red-500">*</span></Label>
                    <RadioGroup
                      onValueChange={(value) =>
                        setValue('gender', value as 'Male' | 'Female' | 'Other')
                      }
                      className="flex gap-4 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Male" />
                        <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Female"  />
                        <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Other" />
                        <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-gray-900 font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register('phoneNumber')}
                      placeholder="9876543210"
                      maxLength={10}
                      className="bg-white"
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber" className="text-gray-900 font-medium">
                      Whatsapp Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register('whatsappNumber')}
                      placeholder="9876543254"
                      maxLength={10}
                      className="bg-white"
                    />
                    {errors.whatsappNumber && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.whatsappNumber.message}
                      </p>
                    )}
                  </div>
                  
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-blue-200 pb-2">
                  Address Details
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1" className="text-gray-900 font-medium">
                    Address Line 1 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('addressLine1')}
                    placeholder="House No., Street Name"
                    className="bg-white"
                  />
                  {errors.addressLine1 && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-gray-900 font-medium">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input {...register('state')} placeholder="Assam" className="bg-white" />
                    {errors.state && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-gray-900 font-medium">
                      Pincode <span className="text-red-500">*</span>
                    </Label>
                    <Input {...register('pincode')} placeholder="781001" maxLength={6} className="bg-white" />
                    {errors.pincode && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.pincode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-blue-200 pb-2">
                  Medical Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="medicalHistory" className="text-gray-900 font-medium">Medical History</Label>
                  <Textarea
                    {...register('medicalHistory')}
                    placeholder="Any relevant medical history"
                    className="resize-none h-24 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-gray-900 font-medium">Allergies</Label>
                  <Textarea
                    {...register('allergies')}
                    placeholder="Any known allergies"
                    className="resize-none h-24 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referredBy" className="text-gray-900 font-medium">Referred By Doctor</Label>
                  <Select
                    onValueChange={(value) => setValue('referredBy', Number(value))}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Doctor (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurancePolicyNumber" className="text-gray-900 font-medium">Insurance Policy Number</Label>
                  <Input
                    {...register('insurancePolicyNumber')}
                    placeholder="POL-123456789"
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Tests Selection */}
              {/* <div className="space-y-4 bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-blue-200 pb-2">
                  Select Tests <span className="text-red-500">*</span>
                </h3>

                <div className="space-y-3">
                  {tests.map((test) => (
                    <label
                      key={test.id}
                      className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
                    >
                      <input type="text" className='hidden' />
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedTests.includes(test.id)}
                          onCheckedChange={() => handleTestToggle(test.id)}
                        />
                        <div>
                          <span className="font-semibold text-gray-900">{test.name}</span>
                          {test.description && (
                            <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-blue-600 font-bold text-lg">₹{test.price}</span>
                    </label>
                  ))}
                </div>

                {errors.testIds && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.testIds.message}
                  </p>
                )}

                {selectedTests.length > 0 && (
                  <div className="mt-4 p-6 bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total Amount:</span>
                      <span className="text-3xl font-bold">
                        ₹{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div> */}

              {/* Consent */}
              <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-blue-200 pb-2">
                  Authorization & Consent
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <Checkbox
                      checked={patientConsent}
                      onCheckedChange={(checked) =>
                        setValue('patientConsent', checked as boolean)
                      }
                    />
                    <div className="space-y-1">
                      <Label htmlFor="consent" className="font-semibold cursor-pointer text-gray-900">
                        Patient Consent for Testing <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-sm text-gray-600">
                        I consent to the laboratory testing as ordered by my physician and understand the procedures involved
                      </p>
                    </div>
                  </div>
                  {errors.patientConsent && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.patientConsent.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg py-6 shadow-lg" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      Register & Proceed to Billing
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/' })}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}