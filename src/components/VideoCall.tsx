import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { apiUrl } from "@/utils/APIUrl";
import { Button } from "@/components/dashboards/ui/button";

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

  const endCall = () => {
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    socketRef.current?.disconnect();
    navigate(-1);
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
      } catch (err: any) {
        setMediaError("Camera/Microphone blocked. Please allow permissions and reload.");
        return;
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
        pc.ontrack = (event) => {
          event.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
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
      });

      socket.on("peer-joined", async ({ socketId }) => {
        const pc = createPeerConnection(socketId);
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
        // Clear remote video when peer leaves
        if (remoteVideoRef.current) {
          const media = remoteVideoRef.current.srcObject as MediaStream | null;
          media?.getTracks().forEach((t) => t.stop());
          remoteVideoRef.current.srcObject = null;
        }
      });
    };

    init();
    return () => {
      isMounted = false;
      endCall();
    };
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
    <div className="relative px-4 pt-28 md:pt-32 h-[calc(100vh-7rem)] md:h-[calc(100vh-9rem)]">
      <div className="relative w-full h-full">
        {mediaError && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-red-600 text-white text-sm md:text-base px-3 py-2 rounded">
            {mediaError}
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
          className="absolute bottom-4 right-4 w-32 h-24 md:w-48 md:h-36 rounded-lg bg-black object-cover shadow-lg border border-white/20"
        />

        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded bg-black/50 text-white px-3 py-2">
            <span className="text-xs md:text-sm">Room ID:</span>
            <span className="font-mono text-xs md:text-sm truncate max-w-[40vw] md:max-w-[50vw]">{roomId}</span>
            <Button size="sm" variant="outline" onClick={copyRoomLink} className="ml-2">
              {copying ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={toggleAudio}>{isAudioEnabled ? 'Mute' : 'Unmute'}</Button>
            <Button size="sm" variant="outline" onClick={toggleVideo}>{isVideoEnabled ? 'Hide Cam' : 'Show Cam'}</Button>
            <Button size="sm" variant="destructive" onClick={endCall}>End Call</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;





