import Peer, { type DataConnection } from 'peerjs';
import type { CharacterConfig, EmoteType, EnvironmentId } from '../types/character';
import type { ChatBubbleMessage, ConnectionStatus, NetPacket } from '../types/multiplayer';
export class MultiplayerManager {
  private peer?: Peer;
  private connections = new Map<string, DataConnection>();
  private peerId = '';
  private roomCode = '';
  private isHost = false;
  private config?: CharacterConfig;
  private statusListener: (status: ConnectionStatus, room: string) => void = () => undefined;
  private packetListener: (packet: NetPacket) => void = () => undefined;
  private peerLeaveListener: (peerId: string) => void = () => undefined;
  onStatus(listener: (status: ConnectionStatus, room: string) => void): void { this.statusListener = listener; }
  onPacket(listener: (packet: NetPacket) => void): void { this.packetListener = listener; }
  onPeerLeave(listener: (peerId: string) => void): void { this.peerLeaveListener = listener; }
  async host(config: CharacterConfig): Promise<string> {
    this.leave();
    this.config = config;
    this.isHost = true;
    this.roomCode = Math.random().toString(36).slice(2, 7).toUpperCase();
    return this.startPeer(`tomodachi-studio-${this.roomCode}`, 'hosting');
  }
  async join(roomCode: string, config: CharacterConfig): Promise<void> {
    this.leave();
    this.config = config;
    this.isHost = false;
    this.roomCode = roomCode.replace(/[^a-z0-9]/gi, '').slice(0, 5).toUpperCase();
    if (this.roomCode.length !== 5) throw new Error('Il codice della stanza deve avere 5 caratteri.');
    await this.startPeer(undefined, 'connecting');
    const connection = this.peer!.connect(`tomodachi-studio-${this.roomCode}`, { reliable: true });
    this.attach(connection);
  }
  private startPeer(id: string | undefined, status: ConnectionStatus): Promise<string> {
    this.updateStatus(status);
    const options = { debug: 0 };
    this.peer = id ? new Peer(id, options) : new Peer(options);
    return new Promise((resolve, reject) => {
      this.peer!.on('open', (peerId) => {
        this.peerId = peerId;
        this.updateStatus(status === 'hosting' ? 'hosting' : 'connecting');
        resolve(peerId);
      });
      this.peer!.on('connection', (connection) => {
        if (this.connections.size >= 4) { connection.close(); return; }
        this.attach(connection);
      });
      this.peer!.on('error', (error) => {
        this.updateStatus('error');
        reject(new Error(`Connessione PeerJS non riuscita: ${error.message}`));
      });
      this.peer!.on('disconnected', () => this.updateStatus('disconnected'));
    });
  }
  private attach(connection: DataConnection): void {
    this.connections.set(connection.peer, connection);
    connection.on('open', () => {
      this.updateStatus('connected');
      if (this.config) this.sendTo(connection, { type: 'hello', senderId: this.peerId, config: this.config, position: { x: 0, y: 0, z: 0 }, rotationY: 0 });
    });
    connection.on('data', (data) => {
      if (isNetPacket(data)) {
        this.packetListener(data);
        for (const [peerId, other] of this.connections) if (peerId !== connection.peer && other.open) other.send(data);
      }
    });
    connection.on('close', () => { this.connections.delete(connection.peer); this.peerLeaveListener(connection.peer); this.updateStatus(this.connections.size ? 'connected' : this.isHost ? 'hosting' : 'disconnected'); });
    connection.on('error', () => { this.connections.delete(connection.peer); this.updateStatus('error'); });
  }
  send(packet: NetPacket): void { for (const connection of this.connections.values()) if (connection.open) this.sendTo(connection, packet); }
  shareConfig(config: CharacterConfig): void { this.config = config; this.send({ type: 'config_update', senderId: this.peerId, config }); }
  sendChat(text: string, config: CharacterConfig): void {
    const packet: ChatBubbleMessage = { id: crypto.randomUUID(), peerId: this.peerId, senderName: config.name, text: text.slice(0, 180), voicePitch: config.voicePitch, timestamp: Date.now() };
    this.send({ type: 'chat', senderId: packet.peerId, senderName: packet.senderName, text: packet.text, voicePitch: packet.voicePitch, timestamp: packet.timestamp });
  }
  setEnvironment(environment: EnvironmentId): void { this.send({ type: 'env_change', senderId: this.peerId, environment }); }
  sendEmote(emote: EmoteType): void { this.send({ type: 'emote', senderId: this.peerId, emote, timestamp: Date.now() }); }
  sendTransform(position: { x: number; y: number; z: number }, rotationY: number, isMoving: boolean): void {
    this.send({ type: 'transform', senderId: this.peerId, position, rotationY, isMoving });
  }
  getInviteUrl(): string { return `${location.origin}${location.pathname}#room=${this.roomCode}`; }
  leave(): void {
    for (const peerId of this.connections.keys()) this.peerLeaveListener(peerId);
    this.connections.forEach((connection) => connection.close());
    this.connections.clear();
    if (this.peer && !this.peer.destroyed) this.peer.destroy();
    this.peer = undefined; this.peerId = ''; this.roomCode = ''; this.isHost = false;
    this.updateStatus('disconnected');
  }
  private sendTo(connection: DataConnection, packet: NetPacket): void { if (connection.open) connection.send(packet); }
  private updateStatus(status: ConnectionStatus): void { this.statusListener(status, this.roomCode); }
}
function isNetPacket(data: unknown): data is NetPacket {
  return typeof data === 'object' && data !== null && 'type' in data && typeof data.type === 'string';
}
