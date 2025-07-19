import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://ffsvsnmlqyfoctjtmrnw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmc3Zzbm1scXlmb2N0anRtcm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzY1MzIsImV4cCI6MjA2ODM1MjUzMn0.vS3LCbtZzqFKPionHweCLKod6YBvgL1VQopOjhQhAFo');

const input = document.getElementById('playerName');
const addBtn = document.getElementById('addPlayer');
const list = document.getElementById('playersList');
const resetBtn = document.getElementById('resetBuzzers');

// Spotify Buttons
const playBtn = document.getElementById('playSong');
const pauseBtn = document.getElementById('pauseSong');
const revealBtn = document.getElementById('revealSong');
const uriInput = document.getElementById('spotifyUri');

let spotifyPlayer;

// 🎮 Spielerfunktionen
async function loadPlayers() {
  const { data } = await supabase.from('players').select('*').order('buzzed_at');
  list.innerHTML = '';
  data.forEach(player => {
    const li = document.createElement('li');
    li.textContent = player.name;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '❌';
    removeBtn.onclick = async () => {
      await supabase.from('players').delete().eq('id', player.id);
      loadPlayers();
    };
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

addBtn.addEventListener('click', async () => {
  const name = input.value.trim();
  if (!name) return;

  const { data } = await supabase.from('players').insert([{ name, buzzed: false }]).select();
  input.value = '';
  loadPlayers();
});

resetBtn.addEventListener('click', async () => {
  await supabase.from('players').update({ buzzed: false, buzzed_at: null }).neq('buzzed', false);
  loadPlayers();
});

// 🎵 Spotify Funktionen
window.onSpotifyWebPlaybackSDKReady = () => {
  const token = localStorage.getItem('spotify_access_token');
  if (!token) {
    alert('Bitte zuerst über spotify-auth.html einloggen!');
    return;
  }

  spotifyPlayer = new Spotify.Player({
    name: 'Buzz Game Player',
    getOAuthToken: cb => cb(token),
    volume: 0.5
  });

  spotifyPlayer.connect();
};

playBtn.addEventListener('click', async () => {
  const uri = uriInput.value.trim();
  if (!uri) return;

  const token = localStorage.getItem('spotify_access_token');

  // Set song in DB
  await supabase.from('current_song').upsert([{ id: 1, uri, revealed: false }]);

  // Play song
  const res = await fetch('https://api.spotify.com/v1/me/player/play', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ uris: [uri] })
  });

  if (res.status !== 204) {
    console.error('Fehler beim Abspielen des Songs:', await res.json());
  }
});

pauseBtn.addEventListener('click', async () => {
  const token = localStorage.getItem('spotify_access_token');
  await fetch('https://api.spotify.com/v1/me/player/pause', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
});

revealBtn.addEventListener('click', async () => {
  await supabase.from('current_song').update({ revealed: true }).eq('id', 1);
});

loadPlayers();

