"use client";

/**
 * Database Client Component - Enhanced UI/UX
 * Professional database browser with improved formatting and design
 */

import { useState, useEffect } from "react";
import { Database, Table, RefreshCw, Loader2, FileText, Calendar, Hash, Type, CheckCircle, XCircle } from "lucide-react";
import { query, getModelCount } from "@/server/actions/database";

interface DatabaseClientProps {
  models: string[];
}

export function DatabaseClient({ models }: DatabaseClientProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recordCount, setRecordCount] = useState(0);

  // Fetch records when model is selected
  useEffect(() => {
    if (!selectedModel) return;

    const fetchRecords = async () => {
      setLoading(true);
      try {
        const [dataResult, countResult] = await Promise.all([
          query(selectedModel, 50),
          getModelCount(selectedModel)
        ]);
        
        if (dataResult.success) {
          setRecords(dataResult.data || []);
        }
        
        if (countResult.success) {
          setRecordCount(countResult.count);
        }
      } catch (error) {
        console.error("Failed to fetch records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [selectedModel]);

  const handleRefresh = () => {
    if (selectedModel) {
      const current = selectedModel;
      setSelectedModel(null);
      setTimeout(() => setSelectedModel(current), 0);
    }
  };

  const formatValue = (key: string, value: any) => {
    if (value === null) return <span className="text-gray-500 italic">null</span>;
    if (value === undefined) return <span className="text-gray-500 italic">undefined</span>;
    
    if (typeof value === 'boolean') {
      return value ? (
        <span className="inline-flex items-center gap-1 text-green-400">
          <CheckCircle className="h-3 w-3" /> true
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-400">
          <XCircle className="h-3 w-3" /> false
        </span>
      );
    }
    
    if (value instanceof Date || (typeof value === 'string' && key.toLowerCase().includes('date') || key.toLowerCase().includes('at'))) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return (
            <span className="text-blue-300 font-mono text-xs">
              {date.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          );
        }
      } catch (e) {}
    }
    
    if (typeof value === 'object') return <span className="text-yellow-400 italic">Object</span>;
    
    const strValue = String(value);
    if (strValue.length > 100) {
      return (
        <span className="text-gray-300 text-sm" title={strValue}>
          {strValue.substring(0, 100)}...
        </span>
      );
    }
    
    return <span className="text-gray-200">{strValue}</span>;
  };

  const getFieldIcon = (key: string, value: any) => {
    if (key === 'id') return <Hash className="h-3 w-3" />;
    if (typeof value === 'boolean') return value ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />;
    if (value instanceof Date || key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) return <Calendar className="h-3 w-3" />;
    return <Type className="h-3 w-3" />;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Database className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
              System Database
            </span>
            <h1 className="text-4xl font-heading font-bold gradient-text mt-1">Database Browser</h1>
          </div>
        </div>
        <p className="max-w-3xl text-base text-gray-400 leading-relaxed">
          Explore and inspect your database models with an intuitive interface. View records, relationships, and data structures across all tables.
        </p>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-effect rounded-xl border border-gray-700/50 p-5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Models</p>
              <p className="text-3xl font-bold text-white">{models.length}</p>
            </div>
            <Table className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        <div className="glass-effect rounded-xl border border-gray-700/50 p-5 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Database Type</p>
              <p className="text-lg font-semibold text-white">PostgreSQL</p>
            </div>
            <Database className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="glass-effect rounded-xl border border-gray-700/50 p-5 hover:border-green-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Provider</p>
              <p className="text-lg font-semibold text-white">Neon</p>
            </div>
            <FileText className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="glass-effect rounded-xl border border-gray-700/50 p-5 hover:border-trinity-red/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Records</p>
              <p className="text-3xl font-bold text-white">{recordCount || "—"}</p>
            </div>
            <Hash className="h-8 w-8 text-trinity-red" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Enhanced Models Sidebar */}
        <div className="xl:col-span-1">
          <div className="glass-effect rounded-2xl border border-gray-700/50 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-heading font-semibold text-white">Models</h2>
              <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-md">
                {models.length}
              </span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all group ${
                    selectedModel === model
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10"
                      : "border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      selectedModel === model 
                        ? "bg-purple-500/20 text-purple-400" 
                        : "bg-gray-800/50 text-gray-400 group-hover:bg-gray-700/50"
                    }`}>
                      <Table className="h-4 w-4" />
                    </div>
                    <span className={`font-medium capitalize ${
                      selectedModel === model ? "text-white" : "text-gray-300"
                    }`}>
                      {model}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Data View */}
        <div className="xl:col-span-3">
          {selectedModel ? (
            <div className="glass-effect rounded-2xl border border-gray-700/50 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-b border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                      <Table className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-semibold text-white capitalize">
                        {selectedModel}
                      </h2>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {loading ? "Loading..." : `${records.length} of ${recordCount} records`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="p-3 rounded-xl border border-gray-700/50 bg-gray-800/50 hover:border-purple-500/50 hover:bg-gray-700/50 transition-all group"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Table Content */}
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-20">
                    <Loader2 className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-400 text-lg">Loading records...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex p-4 rounded-full bg-gray-800/50 border border-gray-700/50 mb-4">
                      <Database className="h-12 w-12 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-lg font-medium mb-2">No records found</p>
                    <p className="text-sm text-gray-500">
                      The {selectedModel} table is currently empty
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record, idx) => (
                      <div
                        key={record.id || idx}
                        className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl border border-gray-700/50 p-5 hover:border-gray-600/50 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700/30">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Record #{idx + 1}
                          </span>
                          {record.id && (
                            <span className="text-xs font-mono text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                              ID: {record.id}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                          {Object.entries(record).map(([key, value]) => (
                            <div key={key} className="flex items-start space-x-3 group">
                              <div className="mt-1 text-gray-500 group-hover:text-gray-400 transition-colors">
                                {getFieldIcon(key, value)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                                  {key}
                                </p>
                                <div className="text-sm break-words">
                                  {formatValue(key, value)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-effect rounded-2xl border border-gray-700/50 p-20 text-center">
              <div className="inline-flex p-5 rounded-full bg-gray-800/50 border border-gray-700/50 mb-6">
                <Table className="h-16 w-16 text-gray-500" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-white mb-3">
                Select a Model
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Choose a database model from the sidebar to view its records and explore the data structure
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}