
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Bell, Shield, Palette } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    avatar_emoji: '👤',
    status: 'online' as 'online' | 'away' | 'offline'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          username: data.username || '',
          display_name: data.display_name || '',
          avatar_emoji: data.avatar_emoji || '👤',
          status: data.status || 'online'
        });
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
    setLoading(false);
  };

  const customEmojis = ['💬', '🚀', '⚡', '🔥', '💎', '🌟', '🎯', '🎨', '🎵', '🎮', '📱', '💻', '🛸', '🎪', '🎭', '🎨', '🌈', '🦄', '🐸', '🦋', '🌺', '🍕', '🍔', '🍰', '🎂', '☕', '🍺', '🎊', '🎉', '🎈'];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mr-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
          <h1 className="text-2xl font-bold text-blue-400">Settings</h1>
        </div>

        {/* Profile Settings */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <User className="h-5 w-5 mr-2" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <Label htmlFor="display_name" className="text-gray-300">Display Name</Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <Label className="text-gray-300">Avatar Emoji</Label>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                  {profile.avatar_emoji}
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto bg-gray-700 p-2 rounded">
                    {customEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => setProfile(prev => ({ ...prev, avatar_emoji: emoji }))}
                        className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-600 ${
                          profile.avatar_emoji === emoji ? 'bg-blue-600' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Status</Label>
              <div className="flex space-x-2 mt-2">
                {(['online', 'away', 'offline'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setProfile(prev => ({ ...prev, status }))}
                    className={`px-3 py-1 rounded capitalize ${
                      profile.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Shield className="h-5 w-5 mr-2" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={signOut}
              variant="destructive"
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
