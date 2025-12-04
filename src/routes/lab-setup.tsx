import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, CheckCircle2, Home, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createLabInfo, getMainLabInfo, updateLabInfo } from '@/routes/api/lab-info';

export const Route = createFileRoute('/lab-setup')({
  component: LabSetup,
});

function LabSetup() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [existingLab, setExistingLab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const createLabFn = useServerFn(createLabInfo);
  const getLabFn = useServerFn(getMainLabInfo);
  const updateLabFn = useServerFn(updateLabInfo);

  const labSchema = z.object({
    labName: z.string().min(1, 'Lab name is required'),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    gstinNumber: z.string().optional(),
    policeStationName: z.string().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm({
    resolver: zodResolver(labSchema),
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate({ to: '/login' });
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== 'master') {
      navigate({ to: '/dashboard/' + user.role });
      return;
    }

    setCurrentUser(user);
    loadExistingLab();
  }, [navigate]);

  const loadExistingLab = async () => {
    try {
      setLoading(true);
      const result = await getLabFn();
      if (result.success) {
        setExistingLab(result.labInfo);
        setValue('labName', result.labInfo.labName);
        setValue('registrationNumber', result.labInfo.registrationNumber);
        if (result.labInfo.gstinNumber) setValue('gstinNumber', result.labInfo.gstinNumber);
        if (result.labInfo.policeStationName) setValue('policeStationName', result.labInfo.policeStationName);
        if (result.labInfo.address) setValue('address', result.labInfo.address);
        if (result.labInfo.phoneNumber) setValue('phoneNumber', result.labInfo.phoneNumber);
        if (result.labInfo.labLogo) setLogoPreview(result.labInfo.labLogo);
      }
    } catch (err) {
      console.error('Error loading lab info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      setSuccess(false);

      const submitData = {
        ...data,
        ...(logoPreview && { labLogo: logoPreview }),
      };

      if (existingLab) {
        const result = await updateLabFn({ data: { id: existingLab.id, ...submitData } });
        if (result.success) {
          setSuccess(true);
          setExistingLab(result.labInfo);
          setTimeout(() => setSuccess(false), 3000);
        }
      } else {
        const result = await createLabFn({ data: submitData });
        if (result.success) {
          setSuccess(true);
          setExistingLab(result.labInfo);
          setTimeout(() => setSuccess(false), 3000);
        }
      }
    } catch (err) {
      console.error('Error saving lab info:', err);
      setError(err instanceof Error ? err.message : 'Failed to save lab information');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lab Configuration</h1>
              <p className="text-gray-600">Setup your laboratory information</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate({ to: '/dashboard/master' })} 
            variant="outline"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Form Card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-linear-to-r from-blue-600 to-cyan-500 text-white">
            <CardTitle className="text-2xl">
              {existingLab ? 'Update Lab Information' : 'Create Lab Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {success && (
              <Alert className="border-green-300 bg-green-50 shadow-md mb-6">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 ml-2">
                  <strong>Success!</strong> Lab information saved successfully!
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-300 bg-red-50 shadow-md mb-6">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 ml-2">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Lab Logo */}
              <div className="space-y-2">
                <Label className="text-gray-900 font-medium">Lab Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Lab Logo Preview"
                      className="w-24 h-24 rounded-lg border-2 border-gray-200 object-contain p-2 bg-white"
                    />
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Recommended: 200x200px PNG or JPG
                    </p>
                  </div>
                </div>
              </div>

              {/* Lab Name */}
              <div className="space-y-2">
                <Label htmlFor="labName" className="text-gray-900 font-medium">
                  Lab Name <span className="text-red-500">*</span>
                </Label>
                <Input 
                  {...register('labName')} 
                  placeholder="e.g., NextGenLab Diagnostics" 
                  className="bg-white border-2"
                />
                {errors.labName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.labName.message as string}
                  </p>
                )}
              </div>

              {/* Registration Number */}
              <div className="space-y-2">
                <Label htmlFor="registrationNumber" className="text-gray-900 font-medium">
                  Registration Number <span className="text-red-500">*</span>
                </Label>
                <Input 
                  {...register('registrationNumber')} 
                  placeholder="e.g., LAB/REG/2024/001" 
                  className="bg-white border-2"
                />
                {errors.registrationNumber && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.registrationNumber.message as string}
                  </p>
                )}
              </div>

              {/* GSTIN Number */}
              <div className="space-y-2">
                <Label htmlFor="gstinNumber" className="text-gray-900 font-medium">
                  GSTIN Number (Optional)
                </Label>
                <Input 
                  {...register('gstinNumber')} 
                  placeholder="e.g., 27AABCT1234H1Z0" 
                  className="bg-white border-2"
                />
                <p className="text-xs text-gray-600">
                  15-digit Goods and Services Tax Identification Number
                </p>
              </div>

              {/* Police Station */}
              <div className="space-y-2">
                <Label htmlFor="policeStationName" className="text-gray-900 font-medium">
                  Police Station Name (Optional)
                </Label>
                <Input 
                  {...register('policeStationName')} 
                  placeholder="e.g., Central Police Station" 
                  className="bg-white border-2"
                />
                <p className="text-xs text-gray-600">
                  This will be used in bills and reports automatically
                </p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-900 font-medium">
                  Lab Address (Optional)
                </Label>
                <Textarea 
                  {...register('address')} 
                  placeholder="Enter complete lab address" 
                  rows={3}
                  className="resize-none bg-white border-2"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-900 font-medium">
                  Contact Phone Number (Optional)
                </Label>
                <Input 
                  {...register('phoneNumber')} 
                  placeholder="e.g., +91-8765432100" 
                  className="bg-white border-2"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg py-3 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Save Lab Information
                  </>
                )}
              </Button>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This information will be automatically populated in all bills and reports generated by the system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
