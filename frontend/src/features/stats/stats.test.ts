import { describe, expect, it } from 'vitest';
import { BETS, RACES, SNAILS } from './data';
import { betResults, findDatasetProblems, winsBySnail } from './stats';

describe('datos simulados del día', () => {
  it('cumplen los parámetros: 6 caracoles y 6 carreras', () => {
    expect(SNAILS).toHaveLength(6);
    expect(RACES).toHaveLength(6);
  });

  it('son coherentes entre sí', () => {
    expect(findDatasetProblems(SNAILS, RACES, BETS)).toEqual([]);
  });
});

describe('winsBySnail', () => {
  it('las victorias suman exactamente el número de carreras', () => {
    const total = winsBySnail(SNAILS, RACES).reduce((sum, entry) => sum + entry.wins, 0);
    expect(total).toBe(RACES.length);
  });

  it('cuenta las victorias de cada caracol, incluidos los que no ganaron', () => {
    const wins = Object.fromEntries(winsBySnail(SNAILS, RACES).map((e) => [e.snail, e.wins]));
    expect(wins['Turbo Concha']).toBe(3);
    expect(wins['Trueno Lento']).toBe(0);
  });
});

describe('betResults', () => {
  it('ganadas + perdidas es el total de apuestas', () => {
    const { won, lost } = betResults(RACES, BETS);
    expect(won + lost).toBe(BETS.length);
  });

  it('una apuesta se gana solo si el caracol apostado ganó esa carrera', () => {
    const races = [{ number: 1, winnerId: 'a' }];
    expect(betResults(races, [{ raceNumber: 1, snailId: 'a' }])).toEqual({ won: 1, lost: 0 });
    expect(betResults(races, [{ raceNumber: 1, snailId: 'b' }])).toEqual({ won: 0, lost: 1 });
  });
});

describe('findDatasetProblems', () => {
  it('detecta datos incoherentes', () => {
    expect(findDatasetProblems(SNAILS, [{ number: 1, winnerId: 'fantasma' }], [])).not.toEqual([]);
    expect(findDatasetProblems(SNAILS, RACES, [{ raceNumber: 9, snailId: 'rayo' }])).not.toEqual([]);
    expect(findDatasetProblems([...SNAILS, SNAILS[0]], RACES, BETS)).not.toEqual([]);
  });
});