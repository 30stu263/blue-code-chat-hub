
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Phone, PhoneOff, Mic, MicOff } from 'lucide-react';

interface VideoCallProps {
  isActive: boolean;
  isIncoming?: boolean;
  contactName?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  isActive,
  isIncoming = false,
  contactName = 'Contact',
  onAccept,
  onDecline,
  onEnd
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isActive && !isIncoming) {
      startLocalVideo();
    }
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, isIncoming]);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
    }
  };

  const handleAccept = async () => {
    await startLocalVideo();
    onAccept?.();
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  if (!isActive) return null;

  if (isIncoming) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            📞
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Incoming Video Call</h3>
          <p className="text-gray-300 mb-6">from {contactName}</p>
          
          <div className="flex space-x-4 justify-center">
            <Button
              onClick={onDecline}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full"
            >
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Remote Video */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto">
              👤
            </div>
            <p className="text-lg">{contactName}</p>
            <p className="text-sm text-gray-300">Connecting...</p>
          </div>
        </div>
      </div>

      {/* Local Video - Picture in Picture */}
      <div className="absolute top-4 right-4 w-32 h-24 md:w-40 md:h-30 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
        <video
          ref={localVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        {!isVideoEnabled && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <VideoOff className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-full px-6 py-4">
          <Button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            onClick={onEnd}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
