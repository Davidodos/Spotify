
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://ffsvsnmlqyfoctjtmrnw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmc3Zzbm1scXlmb2N0anRtcm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzY1MzIsImV4cCI6MjA2ODM1MjUzMn0.vS3LCbtZzqFKPionHweCLKod6YBvgL1VQopOjhQhAFo');

document.getElementById('setSong').addEventListener('click', async () => {
  const uri = document.getElementById('songUri').value.trim();
  if (!uri) return alert("Bitte eine Spotify-URI eingeben.");
  await supabase.from('settings').upsert([{ key: 'current_song_uri', value: uri }]);
  await supabase.from('settings').upsert([{ key: 'song_visible', value: 'false' }]);
});

document.getElementById('revealSong').addEventListener('click', async () => {
  await supabase.from('settings').upsert([{ key: 'song_visible', value: 'true' }]);
});

document.getElementById('pauseSong').addEventListener('click', async () => {
  await supabase.from('settings').upsert([{ key: 'song_paused', value: 'true' }]);
});

document.getElementById('playSong').addEventListener('click', async () => {
  await supabase.from('settings').upsert([{ key: 'song_paused', value: 'false' }]);
});
