import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload as UploadIcon,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { UploadResult } from '@/types';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }
    setFile(selectedFile);
    setError('');
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const uploadResult = await api.uploadCases(file);
      setResult(uploadResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const template = await api.getUploadTemplate();
      const csvContent = `account_id,debtor_name,debtor_email,debtor_phone,original_amount,currency,days_delinquent
ACC001,John Doe,john@example.com,+1234567890,5000,USD,30
ACC002,Jane Smith,jane@example.com,+1234567891,3500,USD,45`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cases_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Upload Cases</h1>
          <p className="text-dark-400 mt-1">Bulk upload debt collection cases from CSV files</p>
        </div>
        <motion.button
          onClick={downloadTemplate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-secondary"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Template
        </motion.button>
      </div>

      {/* Upload Section */}
      <div className="glass-card p-8">
        {!result ? (
          <div className="space-y-6">
            {/* File Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
              className="border-2 border-dashed border-dark-600 rounded-lg p-12 text-center hover:border-primary-500 transition-colors"
            >
              <UploadIcon className="w-16 h-16 text-dark-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Drop your CSV file here
              </h3>
              <p className="text-dark-400 mb-4">
                or click to browse and select a file
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
              >
                Select File
              </motion.button>
            </div>

            {/* Selected File */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg border border-dark-600"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-primary-400" />
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-dark-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={handleUpload}
                    disabled={uploading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <UploadIcon className="w-5 h-5 mr-2" />
                    )}
                    {uploading ? 'Uploading...' : 'Upload'}
                  </motion.button>
                  <button
                    onClick={resetUpload}
                    className="text-dark-400 hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
              >
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Upload Results */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Upload Complete</h3>
              <p className="text-dark-400">
                Processed {result.total_rows} rows from your CSV file
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {result.summary.successful_count}
                </div>
                <div className="text-sm text-green-300">Successful</div>
              </div>
              
              <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {result.summary.failed_count}
                </div>
                <div className="text-sm text-red-300">Failed</div>
              </div>
              
              <div className="text-center p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {result.summary.success_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-300">Success Rate</div>
              </div>
            </div>

            {/* Failed Records */}
            {result.failed.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  Failed Records ({result.failed.length})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {result.failed.map((failure, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-400">
                            Row {failure.row}
                          </p>
                          <p className="text-sm text-red-300 mt-1">
                            {failure.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center space-x-4">
              <motion.button
                onClick={resetUpload}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary"
              >
                Upload Another File
              </motion.button>
              <motion.button
                onClick={() => window.location.href = '/cases'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
              >
                View Cases
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upload Instructions</h3>
        <div className="space-y-3 text-sm text-dark-300">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-400 rounded-full mt-2"></div>
            <p>Download the CSV template to see the required format and column headers</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-400 rounded-full mt-2"></div>
            <p>Ensure all required fields are filled: account_id, debtor_name, original_amount</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-400 rounded-full mt-2"></div>
            <p>Amount values should be numeric without currency symbols</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-400 rounded-full mt-2"></div>
            <p>The system will automatically calculate recovery scores and assign priorities</p>
          </div>
        </div>
      </div>
    </div>
  );
}