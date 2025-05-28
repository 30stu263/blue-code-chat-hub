
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, UserPlus } from 'lucide-react';

interface AddContactModalProps {
  onClose: () => void;
  onAddContact: (contactId: string) => boolean;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onAddContact }) => {
  const [contactId, setContactId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!contactId.trim()) {
      setError('Please enter a contact ID');
      return;
    }

    if (contactId.length !== 6) {
      setError('Contact ID must be 6 digits');
      return;
    }

    if (!/^\d+$/.test(contactId)) {
      setError('Contact ID must contain only numbers');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const success = onAddContact(contactId);
      if (success) {
        onClose();
      } else {
        setError('Contact not found or already added');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Add Contact</h3>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contact ID
            </label>
            <input
              type="text"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              placeholder="Enter 6-digit ID (e.g., 123456)"
              maxLength={6}
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <div className="text-sm text-gray-400 mb-4">
            <p>💡 Try these sample IDs:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {['111222', '333444', '555666'].map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setContactId(id)}
                  className="bg-gray-700 hover:bg-gray-600 text-blue-400 px-2 py-1 rounded text-xs"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Contact
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;
