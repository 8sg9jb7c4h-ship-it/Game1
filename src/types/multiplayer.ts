import type { CharacterConfig, EmoteType, EnvironmentId } from './character';
export interface Vec3Tuple { x: number; y: number; z: number }
export interface RemotePlayerState {
  peerId: string; config: CharacterConfig; position: Vec3Tuple; rotationY: number;
  isMoving: boolean; activeEmote: EmoteType; emoteTimestamp: number; lastUpdated: number;
}
export interface ChatBubbleMessage { id: string; peerId: string; senderName: string; text: string; voicePitch: number; timestamp: number }
export type NetPacket =
  | { type: 'hello'; senderId: string; config: CharacterConfig; position: Vec3Tuple; rotationY: number }
  | { type: 'room_sync'; environment: EnvironmentId; players: RemotePlayerState[] }
  | { type: 'transform'; senderId: string; position: Vec3Tuple; rotationY: number; isMoving: boolean }
  | { type: 'config_update'; senderId: string; config: CharacterConfig }
  | { type: 'emote'; senderId: string; emote: EmoteType; timestamp: number }
  | { type: 'chat'; senderId: string; senderName: string; text: string; voicePitch: number; timestamp: number }
  | { type: 'env_change'; senderId: string; environment: EnvironmentId }
  | { type: 'prop_interact'; senderId: string; propId: string; impulse: Vec3Tuple };
export type ConnectionStatus = 'disconnected' | 'hosting' | 'connecting' | 'connected' | 'error';
