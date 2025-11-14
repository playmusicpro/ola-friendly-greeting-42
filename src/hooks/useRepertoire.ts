import { useState } from 'react';
import { Song, Setlist } from '@/types';

const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Evidências',
    artist: 'Chitãozinho e Xororó',
    tone: 'G',
    howYouPlay: 'Dedilhado',
    cifraClubLink: 'https://www.cifraclub.com.br/chitaozinho-e-xororo/evidencias/',
    notes: 'Versão acústica funciona melhor em shows pequenos',
  },
  {
    id: '2',
    title: 'Garota de Ipanema',
    artist: 'Tom Jobim',
    tone: 'F',
    howYouPlay: 'Bossa Nova',
    cifraClubLink: 'https://www.cifraclub.com.br/tom-jobim/garota-de-ipanema/',
    notes: 'Swing leve, cuidado com o tempo',
  },
  {
    id: '3',
    title: 'Toda Forma de Amor',
    artist: 'Lulu Santos',
    tone: 'C',
    howYouPlay: 'Batida pop',
    cifraClubLink: 'https://www.cifraclub.com.br/lulu-santos/toda-forma-de-amor/',
    notes: 'Público sempre pede essa',
  },
];

const mockSetlists: Setlist[] = [
  {
    id: '1',
    name: 'Setlist Bar do Zé - Dezembro',
    songIds: ['1', '2'],
    createdAt: '2024-12-01',
  },
];

export function useRepertoire() {
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [setlists, setSetlists] = useState<Setlist[]>(mockSetlists);

  const addSong = (songData: Omit<Song, 'id'>) => {
    const newSong: Song = {
      ...songData,
      id: Date.now().toString(),
    };
    setSongs(prev => [...prev, newSong].sort((a, b) => a.title.localeCompare(b.title)));
  };

  const updateSong = (id: string, songData: Omit<Song, 'id'>) => {
    setSongs(prev => prev.map(song => 
      song.id === id ? { ...songData, id } : song
    ).sort((a, b) => a.title.localeCompare(b.title)));
  };

  const deleteSong = (id: string) => {
    setSongs(prev => prev.filter(song => song.id !== id));
    // Remove song from all setlists
    setSetlists(prev => prev.map(setlist => ({
      ...setlist,
      songIds: setlist.songIds.filter(songId => songId !== id),
    })));
  };

  const updateSongTone = (id: string, newTone: string) => {
    setSongs(prev => prev.map(song => 
      song.id === id ? { ...song, tone: newTone } : song
    ));
  };

  const addSetlist = (setlistData: Omit<Setlist, 'id' | 'createdAt'>) => {
    const newSetlist: Setlist = {
      ...setlistData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSetlists(prev => [...prev, newSetlist]);
  };

  const updateSetlist = (id: string, setlistData: Omit<Setlist, 'id' | 'createdAt'>) => {
    setSetlists(prev => prev.map(setlist => 
      setlist.id === id ? { ...setlistData, id, createdAt: setlist.createdAt } : setlist
    ));
  };

  const deleteSetlist = (id: string) => {
    setSetlists(prev => prev.filter(setlist => setlist.id !== id));
  };

  return {
    songs,
    setlists,
    addSong,
    updateSong,
    deleteSong,
    updateSongTone,
    addSetlist,
    updateSetlist,
    deleteSetlist,
  };
}
