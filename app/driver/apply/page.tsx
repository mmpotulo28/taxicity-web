"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Icon } from "@iconify/react";
import { Select, SelectItem } from "@heroui/select";
import { useDriver } from "@/context/DriverContext";

export default function DriverApplicationPage() {
 const router = useRouter();
 const { driver, isLoading } = useDriver();
 const [submitting, setSubmitting] = useState(false);
 const [step, setStep] = useState(1);
 const [routes, setRoutes] = useState<any[]>([]);

 // Form State
 const [formData, setFormData] = useState({
  licenseNumber: "",
  licenseExpiry: "",
  licenseImageFront: "",
  licenseImageBack: "",
  plateNumber: "",
  make: "",
  model: "",
  year: "",
  color: "",
  capacity: "",
  routeId: "",
  registrationDoc: "",
  insuranceDoc: "",
  permitDoc: ""
 });

 const [uploading, setUploading] = useState<string | null>(null);

 useEffect(() => {
  // Fetch routes
  fetch("/api/routes")
   .then((res) => res.json())
   .then((data) => setRoutes(data.routes || []))
   .catch((err) => console.error("Failed to fetch routes", err));
 }, []);

 useEffect(() => {
  if (!isLoading && driver) {
   if (driver.status === "ACTIVE") {
    router.push("/driver");
   } else if (driver.status === "PENDING_VERIFICATION") {
    router.push("/driver/status");
   }
  }
 }, [driver, isLoading, router]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
  if (!e.target.files?.[0]) return;

  setUploading(field);
  const file = e.target.files[0];

  try {
   const response = await fetch(`/api/upload?filename=${file.name}`, {
    method: 'POST',
    body: file,
   });

   if (!response.ok) throw new Error('Upload failed');

   const newBlob = await response.json();
   setFormData(prev => ({ ...prev, [field]: newBlob.url }));
  } catch (error) {
   console.error('Error uploading file:', error);
   alert('Failed to upload file');
  } finally {
   setUploading(null);
  }
 };

 const handleSubmit = async () => {
  setSubmitting(true);
  try {
   const res = await fetch("/api/driver/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
   });

   if (res.ok) {
    router.push("/driver/status");
   } else {
    const error = await res.json();
    alert(error.error || "Application failed");
   }
  } catch (error) {
   console.error("Application error:", error);
   alert("Something went wrong. Please try again.");
  } finally {
   setSubmitting(false);
  }
 };

 if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

 return (
  <div className="min-h-screen bg-default-50 p-4 pb-24">
   <div className="max-w-md mx-auto">
    <header className="mb-8 text-center">
     <h1 className="text-2xl font-bold mb-2">Become a Driver</h1>
     <p className="text-default-500">Complete the application to start earning</p>
    </header>

    <Card className="mb-6">
     <CardHeader className="flex gap-3">
      <div className="flex flex-col">
       <p className="text-md font-bold">Step {step} of 4</p>
       <p className="text-small text-default-500">
        {step === 1
         ? "Driver Information"
         : step === 2
          ? "Vehicle Information"
          : step === 3
           ? "Route Selection"
           : "Documents"}
       </p>
      </div>
     </CardHeader>
     <CardBody>
      {step === 1 && (
       <div className="space-y-4">
        <Input
         label="Driver's License Number"
         name="licenseNumber"
         placeholder="Enter your license number"
         value={formData.licenseNumber}
         onChange={handleChange}
         isRequired
        />
        <Input
         type="date"
         label="License Expiry Date"
         name="licenseExpiry"
         placeholder="Select expiry date"
         value={formData.licenseExpiry}
         onChange={handleChange}
         isRequired
        />

        <div className="grid grid-cols-2 gap-4">
         <div>
          <p className="text-small mb-2">License Front</p>
          <div
           className="border-2 border-dashed border-default-300 rounded-lg p-4 text-center hover:bg-default-100 cursor-pointer transition-colors relative h-32 flex flex-col items-center justify-center"
           onClick={() => document.getElementById('licenseFront')?.click()}
          >
           {formData.licenseImageFront ? (
            <img src={formData.licenseImageFront} alt="Front" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
           ) : (
            <>
             <Icon icon="lucide:camera" className="w-6 h-6 mb-1 text-default-500" />
             <span className="text-xs text-default-500">{uploading === 'licenseImageFront' ? 'Uploading...' : 'Upload Front'}</span>
            </>
           )}
           <input
            id="licenseFront"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'licenseImageFront')}
           />
          </div>
         </div>
         <div>
          <p className="text-small mb-2">License Back</p>
          <div
           className="border-2 border-dashed border-default-300 rounded-lg p-4 text-center hover:bg-default-100 cursor-pointer transition-colors relative h-32 flex flex-col items-center justify-center"
           onClick={() => document.getElementById('licenseBack')?.click()}
          >
           {formData.licenseImageBack ? (
            <img src={formData.licenseImageBack} alt="Back" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
           ) : (
            <>
             <Icon icon="lucide:camera" className="w-6 h-6 mb-1 text-default-500" />
             <span className="text-xs text-default-500">{uploading === 'licenseImageBack' ? 'Uploading...' : 'Upload Back'}</span>
            </>
           )}
           <input
            id="licenseBack"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'licenseImageBack')}
           />
          </div>
         </div>
        </div>

        <Button
         color="primary"
         className="w-full mt-4"
         onPress={() => setStep(2)}
         isDisabled={!formData.licenseNumber || !formData.licenseExpiry || !formData.licenseImageFront || !formData.licenseImageBack}
        >
         Next
        </Button>
       </div>
      )}

      {step === 2 && (
       <div className="space-y-4">
        <Input
         label="Vehicle Plate Number"
         name="plateNumber"
         placeholder="ABC 123 GP"
         value={formData.plateNumber}
         onChange={handleChange}
         isRequired
        />
        <Input
         label="Vehicle Make"
         name="make"
         placeholder="Toyota"
         value={formData.make}
         onChange={handleChange}
         isRequired
        />
        <Input
         label="Vehicle Model"
         name="model"
         placeholder="Toyota Quantum"
         value={formData.model}
         onChange={handleChange}
         isRequired
        />
        <Input
         label="Vehicle Color"
         name="color"
         placeholder="White"
         value={formData.color}
         onChange={handleChange}
         isRequired
        />
        <div className="flex gap-4">
         <Input
          type="number"
          label="Year"
          name="year"
          placeholder="2020"
          value={formData.year}
          onChange={handleChange}
          isRequired
         />
         <Input
          type="number"
          label="Capacity"
          name="capacity"
          placeholder="15"
          value={formData.capacity}
          onChange={handleChange}
          isRequired
         />
        </div>
        <div className="flex gap-2 mt-4">
         <Button variant="flat" onPress={() => setStep(1)} className="flex-1">
          Back
         </Button>
         <Button
          color="primary"
          className="flex-1"
          onPress={() => setStep(3)}
          isDisabled={!formData.plateNumber || !formData.make || !formData.model || !formData.year || !formData.color || !formData.capacity}
         >
          Next
         </Button>
        </div>
       </div>
      )}

      {step === 3 && (
       <div className="space-y-4">
        <p className="text-small text-default-500">
         Select the primary route you will be operating on. You must provide a valid operating permit for this route in the next step.
        </p>
        <Select
         label="Select Route"
         placeholder="Choose a route"
         selectedKeys={formData.routeId ? [formData.routeId] : []}
         onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
        >
         {routes.map((route) => (
          <SelectItem key={route.id}>
           {route.name}
          </SelectItem>
         ))}
        </Select>

        <div className="flex gap-2 mt-4">
         <Button variant="flat" onPress={() => setStep(2)} className="flex-1">
          Back
         </Button>
         <Button
          color="primary"
          className="flex-1"
          onPress={() => setStep(4)}
          isDisabled={!formData.routeId}
         >
          Next
         </Button>
        </div>
       </div>
      )}

      {step === 4 && (
       <div className="space-y-6">
        {/* Registration Document */}
        <div>
         <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${formData.registrationDoc ? 'border-success bg-success-50' : 'border-default-300 hover:bg-default-100'}`}
          onClick={() => document.getElementById('regDoc')?.click()}
         >
          {formData.registrationDoc ? (
           <>
            <Icon icon="lucide:check-circle" className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-sm font-medium text-success-700">Registration Document Uploaded</p>
           </>
          ) : (
           <>
            <Icon icon="lucide:file-text" className="w-8 h-8 mx-auto mb-2 text-default-500" />
            <p className="text-sm font-medium">Upload Registration Document</p>
            <p className="text-xs text-default-400 mt-1">{uploading === 'registrationDoc' ? 'Uploading...' : 'Tap to select file'}</p>
           </>
          )}
          <input
           id="regDoc"
           type="file"
           className="hidden"
           accept=".pdf,image/*"
           onChange={(e) => handleFileUpload(e, 'registrationDoc')}
          />
         </div>
        </div>

        {/* Insurance Document */}
        <div>
         <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${formData.insuranceDoc ? 'border-success bg-success-50' : 'border-default-300 hover:bg-default-100'}`}
          onClick={() => document.getElementById('insDoc')?.click()}
         >
          {formData.insuranceDoc ? (
           <>
            <Icon icon="lucide:check-circle" className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-sm font-medium text-success-700">Insurance Document Uploaded</p>
           </>
          ) : (
           <>
            <Icon icon="lucide:shield-check" className="w-8 h-8 mx-auto mb-2 text-default-500" />
            <p className="text-sm font-medium">Upload Insurance Document</p>
            <p className="text-xs text-default-400 mt-1">{uploading === 'insuranceDoc' ? 'Uploading...' : 'Tap to select file'}</p>
           </>
          )}
          <input
           id="insDoc"
           type="file"
           className="hidden"
           accept=".pdf,image/*"
           onChange={(e) => handleFileUpload(e, 'insuranceDoc')}
          />
         </div>
        </div>

        {/* Permit Document */}
        <div>
         <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${formData.permitDoc ? 'border-success bg-success-50' : 'border-default-300 hover:bg-default-100'}`}
          onClick={() => document.getElementById('permitDoc')?.click()}
         >
          {formData.permitDoc ? (
           <>
            <Icon icon="lucide:check-circle" className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-sm font-medium text-success-700">Operating Permit Uploaded</p>
           </>
          ) : (
           <>
            <Icon icon="lucide:badge-check" className="w-8 h-8 mx-auto mb-2 text-default-500" />
            <p className="text-sm font-medium">Upload Operating Permit</p>
            <p className="text-xs text-default-400 mt-1">Must be valid for the selected route</p>
            <p className="text-xs text-default-400 mt-1">{uploading === 'permitDoc' ? 'Uploading...' : 'Tap to select file'}</p>
           </>
          )}
          <input
           id="permitDoc"
           type="file"
           className="hidden"
           accept=".pdf,image/*"
           onChange={(e) => handleFileUpload(e, 'permitDoc')}
          />
         </div>
        </div>

        <div className="flex gap-2 mt-4">
         <Button variant="flat" onPress={() => setStep(3)} className="flex-1">
          Back
         </Button>
         <Button
          color="primary"
          className="flex-1"
          onPress={handleSubmit}
          isLoading={submitting}
          isDisabled={!formData.registrationDoc || !formData.insuranceDoc || !formData.permitDoc}
         >
          Submit Application
         </Button>
        </div>
       </div>
      )}
     </CardBody>
    </Card>
   </div>
  </div>
 );
}
