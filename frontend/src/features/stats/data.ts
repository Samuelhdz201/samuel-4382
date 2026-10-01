export interface Snail {
  id: string;
  name: string;
}

export interface Race {
  number: number;
  winnerId: string;
}

export interface Bet {
  raceNumber: number;
  snailId: string;
}

// Datos simulados de un día: 6 caracoles y 6 carreras (un ganador por carrera).
export const SNAILS: readonly Snail[] = [
  { id: 'rayo', name: 'Rayo Baboso' },
  { id: 'turbo', name: 'Turbo Concha' },
  { id: 'espiral', name: 'Don Espiral' },
  { id: 'flash', name: 'Flash Baba' },
  { id: 'trueno', name: 'Trueno Lento' },
  { id: 'lechuga', name: 'Doña Lechuga' },
];

export const RACES: readonly Race[] = [
  { number: 1, winnerId: 'turbo' },
  { number: 2, winnerId: 'rayo' },
  { number: 3, winnerId: 'turbo' },
  { number: 4, winnerId: 'flash' },
  { number: 5, winnerId: 'espiral' },
  { number: 6, winnerId: 'turbo' },
];

// Dos apuestas por carrera. Ganada = el caracol apostado ganó esa carrera.
export const BETS: readonly Bet[] = [
  { raceNumber: 1, snailId: 'rayo' },
  { raceNumber: 1, snailId: 'turbo' },
  { raceNumber: 2, snailId: 'rayo' },
  { raceNumber: 2, snailId: 'flash' },
  { raceNumber: 3, snailId: 'espiral' },
  { raceNumber: 3, snailId: 'lechuga' },
  { raceNumber: 4, snailId: 'flash' },
  { raceNumber: 4, snailId: 'turbo' },
  { raceNumber: 5, snailId: 'trueno' },
  { raceNumber: 5, snailId: 'espiral' },
  { raceNumber: 6, snailId: 'lechuga' },
  { raceNumber: 6, snailId: 'rayo' },
];