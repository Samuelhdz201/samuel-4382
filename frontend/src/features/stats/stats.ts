import type { Bet, Race, Snail } from './data';

export interface WinsEntry {
  snail: string;
  wins: number;
}

/** Victorias de cada caracol, calculadas a partir de las carreras (no escritas a mano). */
export function winsBySnail(snails: readonly Snail[], races: readonly Race[]): WinsEntry[] {
  return snails.map((snail) => ({
    snail: snail.name,
    wins: races.filter((race) => race.winnerId === snail.id).length,
  }));
}

/** Una apuesta se gana si el caracol apostado ganó esa carrera. */
export function betResults(races: readonly Race[], bets: readonly Bet[]) {
  const winnerByRace = new Map(races.map((race) => [race.number, race.winnerId]));
  const won = bets.filter((bet) => winnerByRace.get(bet.raceNumber) === bet.snailId).length;
  return { won, lost: bets.length - won };
}

/** Revisa que los datos simulados respeten las reglas. Devuelve la lista de problemas. */
export function findDatasetProblems(
  snails: readonly Snail[],
  races: readonly Race[],
  bets: readonly Bet[],
): string[] {
  const problems: string[] = [];
  const snailIds = new Set(snails.map((snail) => snail.id));

  if (snailIds.size !== snails.length) problems.push('Hay caracoles con id repetido.');
  races.forEach((race, index) => {
    if (race.number !== index + 1) problems.push(`La carrera ${race.number} no está en orden.`);
    if (!snailIds.has(race.winnerId)) problems.push(`La carrera ${race.number} tiene un ganador inexistente.`);
  });
  bets.forEach((bet) => {
    if (!races.some((race) => race.number === bet.raceNumber))
      problems.push(`Hay una apuesta a la carrera inexistente ${bet.raceNumber}.`);
    if (!snailIds.has(bet.snailId)) problems.push(`Hay una apuesta a un caracol inexistente (${bet.snailId}).`);
  });
  return problems;
}