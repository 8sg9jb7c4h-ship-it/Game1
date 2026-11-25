import './styles/main.css';
import type { CharacterConfig, EmoteType, EnvironmentId } from './types/character';
import type { NetPacket, Vec3Tuple } from './types/multiplayer';
import { SettingsManager } from './core/SettingsManager';
import { GameStateManager } from './core/GameStateManager';
import { StorageManager } from './core/StorageManager';
import { SoundEngine } from './audio/SoundEngine';
import { SceneManager } from './engine/SceneManager';
import { createCharacter, createPreset } from './ai/PresetLibrary';
import { generateCharacter } from './ai/PromptGenerator';
import { MultiplayerManager } from './network/MultiplayerManager';
import { hudManager } from './ui/HudManager';
import { mainMenu } from './ui/MainMenu';
import { multiplayerHud } from './ui/MultiplayerHud';
import { settingsModal } from './ui/SettingsModal';
import { titleScreen } from './ui/TitleScreen';
import { characterUrl, copyText, downloadJson, downloadPng } from './ui/ShareManager';
import type { ConnectionStatus } from './types/multiplayer';
import type { GameSettings } from './types/settings';
import type { SavedCharacterSlot } from './types/character';

const root = document.querySelector<HTMLElement>('#ui-root');
const canvas = document.querySelector<HTMLCanvasElement>('#studio-canvas');
if (!root || !canvas) throw new Error('The game interface could not be initialized.');

const settings = new SettingsManager();
const storage = new StorageManager();
const character = storage.loadDraft() ?? createCharacter();
const game = new GameStateManager(character);
let config = game.get().character;
let currentScreen = game.get().screen;
let activeEnvironment = game.get().environment;
let scene: SceneManager;
let modalOpen = false;
let busy = false;
let roomStatus: ConnectionStatus = 'disconnected';
let roomCode = game.get().roomCode;
let chatMessages: Array<{ name: string; text: string; mine: boolean }> = [];
const remotePlayers = new Map<string, { config: CharacterConfig; position: Vec3Tuple; rotationY: number }>();
const localPosition: Vec3Tuple = { x: 0, y: 0, z: 0 };
const movementKeys = new Set<string>();
let localRotation = 0;
let networkTick = 0;
let toastTimer = 0;
const sound = new SoundEngine(settings);
const network = new MultiplayerManager();
scene = new SceneManager(canvas, config, settings.get(), (prop) => {
  sound.play(prop === 'confetti' ? 'confetti' : prop === 'headpat' ? 'boing' : 'pop');
  if (prop === 'boombox') sound.toggleMusic();
  if (prop === 'headpat') sound.speak('Ciao!', config.voicePitch);
});

function render(): void {
  const state = game.get();
  currentScreen = state.screen;
  config = state.character;
  activeEnvironment = state.environment;
  let content = '';
  if (currentScreen === 'title') content = titleScreen();
  if (currentScreen === 'menu') content = mainMenu();
  if (currentScreen === 'studio') content = hudManager(config);
  if (currentScreen === 'plaza') content = multiplayerHud(roomStatus, roomCode, game.get().roomCode);
  if (currentScreen === 'gallery') content = galleryMarkup(storage.list());
  root!.innerHTML = `${content}${modalOpen ? settingsModal(settings.get()) : ''}<div class="toast" id="toast" role="status"></div><button class="sound-toggle" data-action="music" aria-label="Attiva o disattiva musica">♫</button>`;
  const environmentSelect = root!.querySelector<HTMLSelectElement>('[data-key="environment"]');
  if (environmentSelect) environmentSelect.value = activeEnvironment;
  root!.querySelectorAll<HTMLButtonElement>('[data-emote]').forEach((button) => button.title = button.dataset.emote ?? '');
  if (chatMessages.length) {
    const log = root!.querySelector<HTMLElement>('#chat-log');
    if (log) log.innerHTML = chatMessages.map((message) => `<div class="chat-message ${message.mine ? 'mine' : ''}"><b>${escapeHtml(message.name)}</b><span>${escapeHtml(message.text)}</span></div>`).join('');
  }
}
function galleryMarkup(slots: SavedCharacterSlot[]): string {
  const cards = Array.from({ length: 12 }, (_, slotIndex) => {
    const slot = slots.find((entry) => entry.slotIndex === slotIndex);
    return slot
      ? `<article class="gallery-slot filled"><div class="slot-avatar" style="--avatar:${escapeHtml(slot.config.outfitPrimaryColor)}">☺</div><b>${escapeHtml(slot.config.name)}</b><span>${new Date(slot.updatedAt).toLocaleDateString()}</span><div class="slot-actions"><button data-load="${slotIndex}">Apri</button><button data-duplicate="${slotIndex}" aria-label="Duplica">＋</button><button data-delete="${slotIndex}" aria-label="Elimina">×</button></div><button class="export-link" data-export="${slotIndex}">Esporta JSON</button></article>`
      : `<article class="gallery-slot empty"><span>✧</span><b>Slot libero</b><button data-action="new-character">Crea personaggio</button></article>`;
  }).join('');
  return `<section class="gallery-panel"><header><button class="text-button" data-action="menu">← Menu</button><div><span class="eyebrow">LA TUA COLLEZIONE</span><h2>Galleria personaggi</h2></div><button class="soft-button" data-action="import">Importa JSON</button><input id="import-file" type="file" accept="application/json,.json" hidden /></header><div class="gallery-grid">${cards}</div></section>`;
}
function toast(message: string): void {
  const element = root!.querySelector<HTMLElement>('#toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => element.classList.remove('visible'), 2600);
}
function changeCharacter(key: string, value: string): void {
  if (key in config.proportions) {
    config = { ...config, proportions: { ...config.proportions, [key]: Number(value) } };
  } else if (key === 'name' || key === 'tagline') {
    config = { ...config, [key]: value };
  } else if (key in config) {
    config = { ...config, [key]: value } as CharacterConfig;
  }
  game.setCharacter(config);
  scene.setCharacter(config);
  storage.saveDraft(config);
  network.shareConfig(config);
}
function updateSettings(target: HTMLInputElement | HTMLSelectElement): void {
  const key = target.dataset.setting as keyof GameSettings | undefined;
  if (!key) return;
  const value = target instanceof HTMLInputElement && target.type === 'checkbox'
    ? target.checked
    : target instanceof HTMLInputElement && target.type === 'range'
      ? Number(target.value)
      : target.value;
  settings.update({ [key]: value } as Partial<GameSettings>);
  scene.setSettings(settings.get());
}
async function connectToRoom(code: string): Promise<void> {
  try { await network.join(code, config); }
  catch (error) { toast(error instanceof Error ? error.message : 'Impossibile entrare nella stanza.'); }
}

root.addEventListener('click', async (event) => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-action], [data-load], [data-delete], [data-duplicate], [data-export], [data-prompt], [data-emote]') : null;
  if (!target) return;
  const action = target.dataset.action;
  if (target.dataset.prompt) {
    const prompt = root!.querySelector<HTMLInputElement>('#character-prompt');
    if (prompt) prompt.value = target.dataset.prompt;
    return;
  }
  if (target.dataset.emote) {
    const emote = target.dataset.emote as EmoteType;
    scene.setEmote(emote); network.sendEmote(emote); sound.play('pop'); return;
  }
  if (target.dataset.load !== undefined) {
    const loaded = storage.load(Number(target.dataset.load));
    if (loaded) { config = loaded; game.setCharacter(config); game.setScreen('studio'); scene.setCharacter(config); toast(`${config.name} è tornatə!`); }
    return;
  }
  if (target.dataset.delete !== undefined) {
    storage.delete(Number(target.dataset.delete)); render(); toast('Personaggio eliminato.'); return;
  }
  if (target.dataset.duplicate !== undefined) {
    try { storage.duplicate(Number(target.dataset.duplicate)); render(); toast('Personaggio duplicato!'); }
    catch (error) { toast(error instanceof Error ? error.message : 'Non è stato possibile duplicare.'); }
    return;
  }
  if (target.dataset.export !== undefined) {
    const saved = storage.load(Number(target.dataset.export));
    if (saved) downloadJson(saved);
    return;
  }
  switch (action) {
    case 'start': sound.unlock(); sound.play('select'); game.setScreen('menu'); break;
    case 'studio': game.setScreen('studio'); sound.play('pop'); break;
    case 'menu':
      if (currentScreen === 'plaza') {
        network.leave(); remotePlayers.clear(); chatMessages = [];
        history.replaceState(null, '', location.pathname);
      }
      game.setScreen('menu');
      break;
    case 'back-title': game.setScreen('title'); break;
    case 'gallery': game.setScreen('gallery'); break;
    case 'plaza': game.setScreen('plaza'); break;
    case 'new-character': config = createCharacter(); game.setCharacter(config); scene.setCharacter(config); game.setScreen('studio'); break;
    case 'settings': modalOpen = true; render(); break;
    case 'close-modal': modalOpen = false; render(); break;
    case 'save':
      try { storage.save(config); storage.saveDraft(config); toast('Personaggio salvato nella galleria!'); sound.play('sparkle'); }
      catch (error) { toast(error instanceof Error ? error.message : 'Salvataggio non riuscito.'); }
      break;
    case 'surprise':
      config = createPreset(Math.floor(Math.random() * 40));
      game.setCharacter(config); scene.setCharacter(config); storage.saveDraft(config); render(); sound.play('sparkle'); break;
    case 'share':
      try { await copyText(characterUrl(config)); toast('Link del personaggio copiato!'); }
      catch { toast('Copia non disponibile: usa il pulsante esporta nella galleria.'); }
      break;
    case 'host':
      try { await network.host(config); }
      catch (error) { toast(error instanceof Error ? error.message : 'Impossibile creare la stanza.'); }
      break;
    case 'copy-room':
      try { await copyText(network.getInviteUrl()); toast('Invito copiato!'); }
      catch { toast('Copia non disponibile nel browser.'); }
      break;
    case 'leave': network.leave(); chatMessages = []; break;
    case 'import': root!.querySelector<HTMLInputElement>('#import-file')?.click(); break;
    case 'photo': downloadPng(canvas); sound.play('shutter'); break;
    case 'music': sound.toggleMusic(); toast('♫ Musica attivata o messa in pausa'); break;
    case 'test-gemini': void testGemini(); break;
  }
});
root.addEventListener('change', async (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.id === 'import-file') {
    const file = target.files?.[0];
    if (!file) return;
    try {
      config = storage.importJson(await file.text());
      config.id = crypto.randomUUID();
      game.setCharacter(config); scene.setCharacter(config); storage.saveDraft(config); game.setScreen('studio'); toast('Personaggio importato!');
    } catch (error) { toast(error instanceof Error ? error.message : 'File non valido.'); }
    return;
  }
  if (target instanceof HTMLInputElement && target.dataset.setting || target instanceof HTMLSelectElement && target.dataset.setting) {
    updateSettings(target as HTMLInputElement | HTMLSelectElement); render(); return;
  }
  if (target instanceof HTMLInputElement && target.dataset.key) {
    changeCharacter(target.dataset.key, target.value);
    if (target.dataset.key === 'name') render();
    return;
  }
  if (target instanceof HTMLSelectElement && target.dataset.key) {
    if (target.dataset.key === 'environment') {
      activeEnvironment = target.value as EnvironmentId;
      game.setEnvironment(activeEnvironment); scene.setEnvironment(activeEnvironment); network.setEnvironment(activeEnvironment);
    } else changeCharacter(target.dataset.key, target.value);
    render();
  }
});
root.addEventListener('input', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.dataset.setting && target.type === 'range') updateSettings(target);
  if (target instanceof HTMLInputElement && target.dataset.key && target.type === 'range') {
    const output = target.closest('label')?.querySelector('output');
    if (output) output.value = Number(target.value).toFixed(2);
  }
});
root.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id === 'prompt-form') {
    const input = root!.querySelector<HTMLInputElement>('#character-prompt');
    if (!input || busy) return;
    busy = true;
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) { button.disabled = true; button.textContent = 'Creo…'; }
    try {
      config = await generateCharacter(input.value, settings.get());
      game.setCharacter(config); scene.setCharacter(config); storage.saveDraft(config); render(); sound.play('sparkle');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Non sono riuscito a creare il personaggio.');
    } finally { busy = false; }
  } else if (form.id === 'join-form') {
    const code = root!.querySelector<HTMLInputElement>('#room-code')?.value ?? '';
    game.setRoomCode(code.toUpperCase());
    await connectToRoom(code);
  } else if (form.id === 'chat-form') {
    const input = root!.querySelector<HTMLInputElement>('#chat-input');
    const text = input?.value.trim();
    if (text) {
      network.sendChat(text, config);
      chatMessages.push({ name: config.name, text, mine: true });
      sound.speak(text, config.voicePitch); render();
    }
  }
});
network.onStatus((status, room) => {
  roomStatus = status; roomCode = room; render();
  if (status === 'hosting' && room) history.replaceState(null, '', `#room=${room}`);
});
network.onPacket((packet: NetPacket) => {
  if (packet.type === 'hello') {
    let position = packet.position;
    if (position.x === 0 && position.y === 0 && position.z === 0) {
      const side = remotePlayers.size % 2 === 0 ? 1 : -1;
      position = { x: side * (1 + Math.floor(remotePlayers.size / 2) * 0.6), y: 0, z: -0.5 };
    }
    remotePlayers.set(packet.senderId, { config: packet.config, position, rotationY: packet.rotationY });
    scene.setRemotePlayer(packet.senderId, packet.config, position, packet.rotationY);
  } else if (packet.type === 'transform') {
    const remote = remotePlayers.get(packet.senderId);
    if (remote) {
      remote.position = packet.position;
      remote.rotationY = packet.rotationY;
      scene.setRemotePlayer(packet.senderId, remote.config, packet.position, packet.rotationY);
    }
  } else if (packet.type === 'config_update') {
    const remote = remotePlayers.get(packet.senderId);
    if (remote) {
      remote.config = packet.config;
      scene.setRemotePlayer(packet.senderId, remote.config, remote.position, remote.rotationY);
    }
  } else if (packet.type === 'chat') {
    chatMessages.push({ name: packet.senderName, text: packet.text, mine: false });
    sound.speak(packet.text, packet.voicePitch);
    render();
  } else if (packet.type === 'emote') scene.setRemoteEmote(packet.senderId, packet.emote);
  else if (packet.type === 'env_change') { activeEnvironment = packet.environment; game.setEnvironment(activeEnvironment); scene.setEnvironment(activeEnvironment); render(); }
});
network.onPeerLeave((peerId) => {
  remotePlayers.delete(peerId);
  scene.removeRemotePlayer(peerId);
});
window.addEventListener('resize', () => scene.resize());
window.addEventListener('keydown', (event) => {
  if (currentScreen !== 'plaza' || event.repeat || event.target instanceof HTMLInputElement) return;
  const key = event.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    movementKeys.add(key);
    event.preventDefault();
  }
  const emote: Record<string, EmoteType> = { '1': 'wave', '2': 'dance', '3': 'laugh', '4': 'love' };
  if (emote[event.key]) { scene.setEmote(emote[event.key]!); network.sendEmote(emote[event.key]!); }
});
window.addEventListener('keyup', (event) => {
  const wasMoving = movementKeys.size > 0;
  movementKeys.delete(event.key.toLowerCase());
  if (wasMoving && movementKeys.size === 0 && currentScreen === 'plaza') network.sendTransform(localPosition, localRotation, false);
});
let previous = performance.now();
function animate(now: number): void {
  const delta = Math.min((now - previous) / 1000, 0.05);
  previous = now;
  if (currentScreen !== 'plaza') movementKeys.clear();
  let dx = 0;
  let dz = 0;
  if (movementKeys.has('a') || movementKeys.has('arrowleft')) dx -= 1;
  if (movementKeys.has('d') || movementKeys.has('arrowright')) dx += 1;
  if (movementKeys.has('w') || movementKeys.has('arrowup')) dz -= 1;
  if (movementKeys.has('s') || movementKeys.has('arrowdown')) dz += 1;
  if (dx || dz) {
    const length = Math.hypot(dx, dz);
    localPosition.x = Math.max(-3, Math.min(3, localPosition.x + (dx / length) * delta * 2));
    localPosition.z = Math.max(-2.5, Math.min(2.5, localPosition.z + (dz / length) * delta * 2));
    localRotation = Math.atan2(dx, dz);
    scene.setLocalPosition(localPosition, localRotation);
    networkTick += delta;
    if (networkTick >= 0.1) {
      network.sendTransform(localPosition, localRotation, true);
      networkTick = 0;
    }
  }
  scene.render(delta);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
settings.subscribe((value) => scene.setSettings(value));
render();
if (game.get().roomCode) void connectToRoom(game.get().roomCode);

async function testGemini(): Promise<void> {
  const apiKey = settings.get().geminiApiKey.trim();
  if (!apiKey) { toast('Aggiungi prima una chiave Gemini.'); return; }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with the single word OK.' }] }] })
    });
    if (!response.ok) throw new Error(`Risposta ${response.status}`);
    toast('Connessione Gemini riuscita!');
  } catch (error) { toast(error instanceof Error ? `Test Gemini non riuscito: ${error.message}` : 'Test Gemini non riuscito.'); }
}
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
window.addEventListener('beforeunload', () => { scene.dispose(); sound.dispose(); network.leave(); });
