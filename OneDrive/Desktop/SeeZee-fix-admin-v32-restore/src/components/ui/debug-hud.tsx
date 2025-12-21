"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface DebugInfo {
  environment: string;
  pathname: string;
  timestamp: string;
  userInfo: {
    authenticated: boolean;
    email?: string;
    role?: string;
    userId?: string;
  };
  middleware: {
    authHeader?: string;
    roleHeader?: string;
    pathnameHeader?: string;
    requiredRoles?: string;
  };
  performance: {
    loadTime: number;
    renderTime: number;
  };
  errors: string[];
}

export default function DebugHUD() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loadTime, setLoadTime] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only show in development
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const startTime = performance.now();
    
    // Capture performance timing
    const handleLoad = () => {
      setLoadTime(performance.now() - startTime);
    };

    window.addEventListener("load", handleLoad);
    
    // Capture JavaScript errors
    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, event.error?.message || event.message]);
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Update debug info when session or pathname changes
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const updateDebugInfo = () => {
      const headers = Object.fromEntries(
        Array.from(document.querySelectorAll('meta[name^="x-debug-"]'))
          .map(el => [
            el.getAttribute('name')?.replace('x-debug-', ''),
            el.getAttribute('content')
          ])
      );

      setDebugInfo({
        environment: process.env.NODE_ENV || "unknown",
        pathname,
        timestamp: new Date().toISOString(),
        userInfo: {
          authenticated: !!session,
          email: session?.user?.email || undefined,
          role: session?.user?.role,
          userId: session?.user?.id,
        },
        middleware: {
          authHeader: headers.auth,
          roleHeader: headers.role,
          pathnameHeader: headers.pathname,
          requiredRoles: headers['required-roles'],
        },
        performance: {
          loadTime,
          renderTime: performance.now(),
        },
        errors,
      });
    };

    updateDebugInfo();
  }, [session, pathname, loadTime, errors]);

  // Don't render in production or during SSR
  if (process.env.NODE_ENV !== "development" || !debugInfo || !isMounted) {
    return null;
  }

  return (
    <>
      {/* Debug Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-mono transition-colors"
          title="Toggle Debug HUD"
        >
          {isVisible ? "Hide Debug" : "Debug"}
        </button>
      </div>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 w-96 max-h-96 overflow-y-auto bg-black/95 border border-red-500/50 rounded-lg p-4 z-50 font-mono text-xs">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-red-400 font-bold">DEBUG HUD</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>

            {/* Environment Info */}
            <div>
              <h4 className="text-yellow-400 font-bold mb-1">Environment</h4>
              <div className="text-green-400">
                <div>Mode: {debugInfo.environment}</div>
                <div>Path: {debugInfo.pathname}</div>
                <div>Time: {new Date(debugInfo.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Authentication Info */}
            <div>
              <h4 className="text-yellow-400 font-bold mb-1">Authentication</h4>
              <div className="text-green-400">
                <div>Status: {status}</div>
                <div>Authenticated: {debugInfo.userInfo.authenticated ? "Yes" : "No"}</div>
                {debugInfo.userInfo.email && (
                  <div>Email: {debugInfo.userInfo.email}</div>
                )}
                {debugInfo.userInfo.role && (
                  <div>Role: {debugInfo.userInfo.role}</div>
                )}
                {debugInfo.userInfo.userId && (
                  <div>User ID: {debugInfo.userInfo.userId.slice(0, 8)}...</div>
                )}
              </div>
            </div>

            {/* Middleware Info */}
            <div>
              <h4 className="text-yellow-400 font-bold mb-1">Middleware</h4>
              <div className="text-green-400">
                <div>Auth Status: {debugInfo.middleware.authHeader || "N/A"}</div>
                <div>Current Role: {debugInfo.middleware.roleHeader || "N/A"}</div>
                <div>Required Roles: {debugInfo.middleware.requiredRoles || "N/A"}</div>
              </div>
            </div>

            {/* Performance Info */}
            <div>
              <h4 className="text-yellow-400 font-bold mb-1">Performance</h4>
              <div className="text-green-400">
                <div>Load Time: {debugInfo.performance.loadTime.toFixed(2)}ms</div>
                <div>Render Time: {debugInfo.performance.renderTime.toFixed(2)}ms</div>
              </div>
            </div>

            {/* Errors */}
            {debugInfo.errors.length > 0 && (
              <div>
                <h4 className="text-red-400 font-bold mb-1">Errors ({debugInfo.errors.length})</h4>
                <div className="text-red-300 max-h-24 overflow-y-auto">
                  {debugInfo.errors.map((error, index) => (
                    <div key={index} className="mb-1 text-xs">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h4 className="text-yellow-400 font-bold mb-1">Quick Actions</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setErrors([])}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                >
                  Clear Errors
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                >
                  Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}