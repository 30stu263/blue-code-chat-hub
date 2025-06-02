
import { useState, useRef, useCallback } from 'react';

interface UseVideoCallReturn {
  isCallActive: boolean;
  isIncomingCall: boolean;
  contactName: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  startCall: (contactName: string) => void;
  receiveCall: (contactName: string) => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
}

export const useVideoCall = (): UseVideoCallReturn => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [contactName, setContactName] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const startCall = useCallback(async (name: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      setContactName(name);
      setIsCallActive(true);
      setIsIncomingCall(false);

      // Simulate connecting to remote peer after 2 seconds
      setTimeout(() => {
        // In a real implementation, this would be the remote peer's stream
        setRemoteStream(stream.clone());
      }, 2000);
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  }, []);

  const receiveCall = useCallback((name: string) => {
    setContactName(name);
    setIsIncomingCall(true);
    setIsCallActive(true);
  }, []);

  const acceptCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      setIsIncomingCall(false);

      // Simulate connecting to remote peer after 1 second
      setTimeout(() => {
        setRemoteStream(stream.clone());
      }, 1000);
    } catch (error) {
      console.error('Error accepting video call:', error);
    }
  }, []);

  const declineCall = useCallback(() => {
    setIsCallActive(false);
    setIsIncomingCall(false);
    setContactName('');
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    
    setIsCallActive(false);
    setIsIncomingCall(false);
    setContactName('');
    setLocalStream(null);
    setRemoteStream(null);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
  }, [localStream, remoteStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  return {
    isCallActive,
    isIncomingCall,
    contactName,
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    startCall,
    receiveCall,
    acceptCall,
    declineCall,
    endCall,
    toggleVideo,
    toggleAudio
  };
};
