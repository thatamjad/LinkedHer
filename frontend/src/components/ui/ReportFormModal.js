import React, { useState } from 'react';
import { useReport } from '../../context/ReportContext';
import { useAuth } from '../../context/AuthContext';

const REPORT_TYPES = [
  { id: 'harassment', label: 'Harassment' },
  { id: 'hate_speech', label: 'Hate Speech' },
  { id: 'misinformation', label: 'Misinformation' },
  { id: 'inappropriate_content', label: 'Inappropriate Content' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'other', label: 'Other' }
];

const ReportFormModal = () => {
  const { authState } = useAuth();
  const { 
    reportFormOpen, 
    reportTarget, 
    reportLoading, 
    reportError,
    reportSuccess,
    closeReportForm,
    submitReport
  } = useReport();
  
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const errors = {};
    if (!reportType) errors.reportType = 'Please select a report type';
    if (description.length < 10) errors.description = 'Please provide more details';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Determine if this is an anonymous report
    const isAnonymous = authState.currentMode === 'anonymous';
    
    try {
      await submitReport({
        reportType,
        contentType: reportTarget.contentType,
        contentId: reportTarget.contentId,
        description,
        isAnonymous,
        reporterPersonaHash: isAnonymous ? authState.currentPersonaHash : undefined,
        reportedContentHash: isAnonymous ? reportTarget.contentHash : undefined,
        reportedUserId: !isAnonymous ? reportTarget.userId : undefined
      });
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  if (!reportFormOpen || !reportTarget) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="bg-purple-600 p-4 text-white">
          <h2 className="text-xl font-bold">Report Content</h2>
        </div>
        
        {/* Success Message */}
        {reportSuccess ? (
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white">Thank You!</h3>
            <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
              Your report has been submitted. Our moderation team will review it soon.
            </p>
            <div className="mt-6">
              <button
                onClick={closeReportForm}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4">
            {/* Report Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                What's the issue?*
              </label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                className={`w-full px-3 py-2 border ${
                  formErrors.reportType ? 'border-red-500' : 'border-gray-300'
                } rounded-md`}
              >
                <option value="">Select a reason</option>
                {REPORT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
              {formErrors.reportType && (
                <p className="mt-1 text-sm text-red-600">{formErrors.reportType}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Details*
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows="4"
                className={`w-full px-3 py-2 border ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                } rounded-md`}
                placeholder="Please explain why this content is being reported..."
              ></textarea>
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>
            
            {/* Error Message */}
            {reportError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                <p>{reportError}</p>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={closeReportForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={reportLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                disabled={reportLoading}
              >
                {reportLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportFormModal; 