"use client";

import { Spinner } from "@heroui/spinner";

export const Loading = () => {
 return (
  <div className="flex h-full w-full items-center justify-center bg-background/50 backdrop-blur-sm z-50 fixed inset-0">
   <Spinner size="lg" color="primary" label="Loading..." />
  </div>
 );
};
