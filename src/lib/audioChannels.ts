export const BGM_AUDIO_CHANNEL = 'bgm';
export const SFX_AUDIO_CHANNEL = 'sfx';
export const VOICE_AUDIO_CHANNEL_WILDCARD = 'voice:*';
export const SOUND_AUDIO_CHANNEL_WILDCARD = 'sound:*';

export function getVoiceAudioChannel(name?: string | null) {
  return name ? `voice:${name}` : 'voice::default';
}

export function getSoundAudioChannel(channel: string) {
  return `sound:${channel}`;
}
