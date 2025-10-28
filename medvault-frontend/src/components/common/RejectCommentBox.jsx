// components/common/RejectCommentBox.jsx
import React, { useRef, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';

const RejectCommentBox = ({ 
  value, 
  onChange, 
  onCancel, 
  onConfirm, 
  isSubmitting = false,
  placeholder = "Provide a reason for rejection (required)",
  title = "Rejection Reason"
}) => {
  const textareaRef = useRef(null);

  // Maintain cursor position and focus
  useEffect(() => {
    if (textareaRef.current && document.activeElement === textareaRef.current) {
      const len = value ? value.length : 0;
      textareaRef.current.selectionStart = len;
      textareaRef.current.selectionEnd = len;
    }
  }, [value]);

  // Auto-focus when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center space-x-2 mb-3">
        <MessageSquare size={16} className="text-red-600" />
        <h4 className="font-semibold text-red-900 text-sm">{title}</h4>
      </div>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 border border-red-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white placeholder-red-400"
        rows={3}
        disabled={isSubmitting}
        maxLength={500}
      />
      
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-red-600">
          {value ? value.length : 0}/500 characters
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!value?.trim() || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <X size={14} />
            )}
            <span>{isSubmitting ? 'Rejecting...' : 'Confirm Reject'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectCommentBox;
