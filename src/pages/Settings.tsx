
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EmojiPicker from '../components/EmojiPicker';

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    avatar_emoji: '👤',
    status: 'online' as 'online' | 'away' | 'offline'
  });
  
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
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
        status: (data.status as 'online' | 'away' | 'offline') || 'online'
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,
        display_name: profile.display_name,
        avatar_emoji: profile.avatar_emoji,
        status: profile.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    }
    setLoading(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setProfile(prev => ({ ...prev, avatar_emoji: emoji }));
    setShowEmojiPicker(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="mr-4 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-gray-300">Display Name</Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter display name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Avatar Emoji</Label>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                  {profile.avatar_emoji}
                </div>
                <Button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Choose Emoji
                </Button>
              </div>
              {showEmojiPicker && (
                <div className="relative">
                  <EmojiPicker
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select
                value={profile.status}
                onValueChange={(value: 'online' | 'away' | 'offline') => 
                  setProfile(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="online" className="text-white hover:bg-gray-600">
                    🟢 Online
                  </SelectItem>
                  <SelectItem value="away" className="text-white hover:bg-gray-600">
                    🟡 Away
                  </SelectItem>
                  <SelectItem value="offline" className="text-white hover:bg-gray-600">
                    ⚫ Offline
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={signOut}
                variant="destructive"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
