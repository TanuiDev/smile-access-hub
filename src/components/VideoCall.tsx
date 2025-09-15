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

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!isMounted) return;
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = io(apiUrl || window.location.origin, { transports: ["websocket"] });
      socketRef.current = socket;

      const createPeerConnection = (peerSocketId: string) => {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: iceServers.map((s) => s.urls!).flat() as unknown as string[] }] as any });
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

      socket.on("signal-answer", async ({ answer }) => {
        for (const pc of peerConnectionsRef.current.values()) {
          if (pc.signalingState !== "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        }
      });

      socket.on("signal-ice-candidate", async ({ candidate }) => {
        for (const pc of peerConnectionsRef.current.values()) {
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

  return (
    <div className="min-h-[80vh] p-4 flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full md:w-[45%] rounded bg-black" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full md:w-[45%] rounded bg-black" />
      </div>
      <div>
        <Button variant="destructive" onClick={endCall}>End Call</Button>
      </div>
    </div>
  );
};

export default VideoCall;


