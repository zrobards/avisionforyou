import React from "react";

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className}`}>
    {children}
  </div>
);
