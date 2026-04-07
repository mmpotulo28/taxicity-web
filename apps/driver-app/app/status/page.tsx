"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useDriver } from "@/context/DriverContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DriverStatusPage() {
 const { driver, isLoading } = useDriver();
 const router = useRouter();

 useEffect(() => {
  if (!isLoading && driver?.status === "ACTIVE") {
   router.push("/");
  }
 }, [driver, isLoading, router]);

 if (isLoading) {
  return (
   <div className="flex items-center justify-center min-h-screen bg-default-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
   </div>
  );
 }

 return (
  <div className="min-h-screen bg-default-50 p-4 flex flex-col items-center justify-center">
   <Card className="w-full max-w-md">
    <CardHeader className="flex flex-col items-center pb-0 pt-6">
     <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mb-4">
      <Icon icon="lucide:clock" className="text-warning w-10 h-10" />
     </div>
     <h1 className="text-2xl font-bold text-center">Application Pending</h1>
    </CardHeader>
    <CardBody className="text-center py-6">
     <p className="text-default-500 mb-6">
      Your driver application has been submitted and is currently under review.
      This process typically takes 24-48 hours.
     </p>

     <div className="bg-default-100 p-4 rounded-lg mb-6 text-left">
      <h3 className="font-semibold mb-2">What happens next?</h3>
      <ul className="list-disc list-inside text-sm text-default-600 space-y-2">
       <li>We verify your driver&apos;s license</li>
       <li>We check your vehicle documentation</li>
       <li>We perform a background check</li>
      </ul>
     </div>

     <Button
      as={Link}
      href="/"
      variant="flat"
      color="default"
      className="w-full"
     >
      Back to Home
     </Button>
    </CardBody>
   </Card>
  </div>
 );
}
