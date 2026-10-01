import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { BETS, RACES } from './data';
import { betResults } from './stats';

const { won, lost } = betResults(RACES, BETS);
const SLICES = [
  { name: 'Ganadas', value: won, color: '#0f6e63' },
  { name: 'Perdidas', value: lost, color: '#c2410c' },
];

export function BetsDonut() {
  return (
    <figure className="chart">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={SLICES} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {SLICES.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <figcaption>
        {won} ganadas y {lost} perdidas de {BETS.length} apuestas.
      </figcaption>
    </figure>
  );
}