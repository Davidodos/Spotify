
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://ffsvsnmlqyfoctjtmrnw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmc3Zzbm1scXlmb2N0anRtcm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzY1MzIsImV4cCI6MjA2ODM1MjUzMn0.vS3LCbtZzqFKPionHweCLKod6YBvgL1VQopOjhQhAFo');

const list = document.getElementById('buzzedList');
const spotifyPlayer = document.getElementById('spotify-player');
const spotifyEmbed = document.getElementById('spotify-embed');

async function loadBuzzers() {
  const { data: players, error } = await supabase
    .from('players')
    .select('*')
    .order('buzzed_at', { ascending: true });

  if (error) {
    console.error('Fehler beim Laden der Buzzer:', error);
    return;
  }

  list.innerHTML = '';
  players.filter(p => p.buzzed).forEach((player, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${player.name}`;
    list.appendChild(li);
  });

  if (players.some(p => p.buzzed)) {
    pauseSpotify();
  }
}

async function loadSong() {
  const { data, error } = await supabase.from('settings').select('*').single();
  if (data && data.revealed && data.spotify_url) {
    spotifyEmbed.src = `https://open.spotify.com/embed/track/${data.spotify_url}`;
    spotifyPlayer.style.display = 'block';
  } else {
    spotifyPlayer.style.display = 'none';
  }
}

function pauseSpotify() {
  const iframe = document.querySelector('#spotify-embed');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'pause' }, '*');
  }
}

setInterval(() => {
  loadBuzzers();
  loadSong();
}, 1000);
