
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Lock, AlertCircle } from 'lucide-react';

interface UpdatesChatPasswordModalProps {
  onClose: () => void;
  onSubmit: (password: string) => Promise<boolean>;
  isLoading: boolean;
}

const UpdatesChatPasswordModal: React.FC<UpdatesChatPasswordModalProps> = ({
  onClose,
  onSubmit,
  isLoading
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      setError('Please enter the password');
      return;
    }

    const success = await onSubmit(password);
    if (!success) {
      setError('Incorrect password or chat is currently controlled by another user');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Updates Chat Access</h2>
          </div>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Enter Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the updates chat password"
              className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-yellow-400/50 focus:ring-yellow-400/20"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="flex-1 text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Take Control'}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-white/60">
            Only one user can control the updates chat at a time. Once you enter the correct password, 
            you'll have exclusive access until you forfeit control.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdatesChatPasswordModal;
