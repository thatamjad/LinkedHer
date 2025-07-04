import React from 'react';
import { useReport } from '../../context/ReportContext';

const ReportButton = ({ contentType, contentId, userId, contentHash }) => {
  const { openReportForm } = useReport();
  
  const handleReport = () => {
    openReportForm({
      contentType,
      contentId,
      userId,
      contentHash
    });
  };
  
  return (
    <button
      onClick={handleReport}
      className="flex items-center text-sm text-gray-500 hover:text-red-500"
      title="Report this content"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className="w-4 h-4 mr-1"
      >
        <path 
          fillRule="evenodd" 
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" 
          clipRule="evenodd" 
        />
      </svg>
      Report
    </button>
  );
};

export default ReportButton; 