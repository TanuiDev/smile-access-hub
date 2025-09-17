import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { apiUrl } from "@/utils/APIUrl";
import { Button } from "@/components/dashboards/ui/button";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Copy } from "lucide-react";
import { useAuthStore } from "@/Store/UserStore";

type PeerConnectionMap = Map<string, RTCPeerConnection>;

const iceServers: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] },
];

const VideoCall: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);

  const socketRef = React.useRef<Socket | null>(null);
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const peerConnectionsRef = React.useRef<PeerConnectionMap>(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
  const [copying, setCopying] = React.useState(false);
  const [mediaError, setMediaError] = React.useState<string | null>(null);
  const [insecureHint, setInsecureHint] = React.useState<string | null>(null);

  const { user } = useAuthStore();

  const endCall = (endForAll: boolean) => {
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (endForAll) {
      try {
        socketRef.current?.emit('end-call', { roomId });
      } catch {}
    }
    socketRef.current?.disconnect();
    navigate('/dashboard');
  };

  React.useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!roomId) return;

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
      } catch (primaryErr: any) {
        // Retry with the most permissive minimal constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (fallbackErr: any) {
          const origin = window.location.origin;
          if (
            window.location.protocol !== 'https:' &&
            !/^http:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/.test(origin)
          ) {
            setInsecureHint("Browser requires HTTPS or localhost for camera/mic. Use https or http://localhost.");
          }
          const name = fallbackErr?.name || primaryErr?.name || 'Error';
          const msg = fallbackErr?.message || primaryErr?.message || 'Access failed.';
          setMediaError(`${name}: ${msg}`);
          return;
        }
      }
      if (!isMounted) return;
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        try { await (localVideoRef.current as HTMLVideoElement).play(); } catch {}
      }

      const socket = io(apiUrl || window.location.origin, { transports: ["websocket"] });
      socketRef.current = socket;

      const createPeerConnection = (peerSocketId: string) => {
        const pc = new RTCPeerConnection({ iceServers });
        // Add tracks
        localStreamRef.current?.getTracks().forEach((track) => {
          localStreamRef.current && pc.addTrack(track, localStreamRef.current);
        });

        const remoteStream = new MediaStream();
        pc.ontrack = async (event) => {
          event.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            try { await (remoteVideoRef.current as HTMLVideoElement).play(); } catch {}
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("signal-ice-candidate", { roomId, candidate: event.candidate });
          }
        };

        peerConnectionsRef.current.set(peerSocketId, pc);
        return pc;
      };

      socket.on("connect", () => {
        socket.emit("join-room", roomId);
        socket.emit("ready", { roomId });
      });

      socket.on("peer-joined", async ({ socketId }) => {
        const pc = createPeerConnection(socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("signal-offer", { roomId, offer });
      });

      socket.on("peer-ready", async ({ socketId }) => {
        const pc = peerConnectionsRef.current.get(socketId) || createPeerConnection(socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("signal-offer", { roomId, offer });
      });

      socket.on("signal-offer", async ({ offer, from }) => {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("signal-answer", { roomId, answer });
      });

      socket.on("signal-answer", async ({ answer, from }) => {
        const pc = peerConnectionsRef.current.get(from);
        if (pc && pc.signalingState !== "stable") {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on("signal-ice-candidate", async ({ candidate, from }) => {
        const pc = peerConnectionsRef.current.get(from);
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {}
        }
      });

      socket.on("peer-left", () => {
        
        if (remoteVideoRef.current) {
          const media = remoteVideoRef.current.srcObject as MediaStream | null;
          media?.getTracks().forEach((t) => t.stop());
          remoteVideoRef.current.srcObject = null;
        }
      });

      socket.on("end-call", () => {
        
        setMediaError("The other participant ended the call.");
        setTimeout(() => endCall(false), 1200);
      });
    };

    init();
    return () => {
      isMounted = false;
      endCall(false);
    };
  }, [roomId]);

  
  React.useEffect(() => {
    if (roomId) localStorage.setItem('current-room-id', roomId);
  }, [roomId]);

  const roomShareUrl = React.useMemo(() => `${window.location.origin}/meet/${roomId}`, [roomId]);

  const toggleAudio = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    tracks.forEach((t) => (t.enabled = !t.enabled));
    setIsAudioEnabled((s) => !s);
  };

  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];
    tracks.forEach((t) => (t.enabled = !t.enabled));
    setIsVideoEnabled((s) => !s);
  };

  const copyRoomLink = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(roomShareUrl);
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="relative px-2 pt-24 md:pt-32 h-[calc(100vh-6.5rem)] md:h-[calc(100vh-9rem)] pb-20 md:pb-0">
      <div className="relative w-full h-full">
        {(mediaError || insecureHint) && (
          <div className="absolute top-4 left-4 right-4 z-20 space-y-2">
            {insecureHint && (
              <div className="bg-amber-600 text-white text-sm md:text-base px-3 py-2 rounded">{insecureHint}</div>
            )}
            {mediaError && (
              <div className="bg-red-600 text-white text-sm md:text-base px-3 py-2 rounded">{mediaError}</div>
            )}
          </div>
        )}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full rounded bg-black object-contain"
        />

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-20 md:bottom-4 right-4 w-32 h-24 md:w-48 md:h-36 rounded-lg bg-black object-cover shadow-lg border border-white/20"
        />

        
        <div className="hidden md:flex absolute top-4 left-4 right-4 z-10 items-center gap-2">
          <div className="flex items-center gap-2 rounded bg-black/50 text-white px-3 py-2">
            <span className="text-xs md:text-sm">Room ID:</span>
            <span className="font-mono text-xs md:text-sm truncate max-w-[40vw] md:max-w-[50vw]">{roomId}</span>
            <Button size="icon" variant="outline" onClick={copyRoomLink} className="ml-2" aria-label="Copy link">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={toggleAudio} aria-label={isAudioEnabled ? 'Mute' : 'Unmute'}>
              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="outline" onClick={toggleVideo} aria-label={isVideoEnabled ? 'Turn camera off' : 'Turn camera on'}>
              {isVideoEnabled ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            {user?.role === 'DENTIST' ? (
              <Button size="sm" variant="destructive" onClick={() => endCall(true)} aria-label="End meeting">End</Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={() => endCall(false)} aria-label="Leave meeting">Leave</Button>
            )}
          </div>
        </div>

        
        <div className="md:hidden absolute bottom-2 left-2 right-2 z-10">
          <div className="mx-auto flex items-center justify-between gap-2 rounded-xl bg-black/60 backdrop-blur px-3 py-2 text-white">
            <Button size="icon" variant="ghost" onClick={toggleAudio} aria-label={isAudioEnabled ? 'Mute' : 'Unmute'} className="text-white">
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={toggleVideo} aria-label={isVideoEnabled ? 'Turn camera off' : 'Turn camera on'} className="text-white">
              {isVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={copyRoomLink} aria-label="Copy link" className="text-white">
              <Copy className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="destructive" onClick={() => endCall(user?.role === 'DENTIST')} aria-label={user?.role === 'DENTIST' ? 'End meeting' : 'Leave meeting'}>
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;





