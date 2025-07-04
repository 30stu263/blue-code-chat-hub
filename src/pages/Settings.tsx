
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
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
    status: 'online' as 'online' | 'away' | 'offline',
    avatar_url: null as string | null
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
        status: (data.status as 'online' | 'away' | 'offline') || 'online',
        avatar_url: data.avatar_url || null
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      
      toast({
        title: "Success",
        description: "Avatar uploaded successfully"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    setProfile(prev => ({ ...prev, avatar_url: null }));
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
        avatar_url: profile.avatar_url,
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
              <Label className="text-gray-300">Profile Picture</Label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl relative overflow-hidden">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile.avatar_emoji
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </Button>
                  </label>
                  {profile.avatar_url && (
                    <Button
                      onClick={removeAvatar}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Avatar Emoji (fallback)</Label>
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
