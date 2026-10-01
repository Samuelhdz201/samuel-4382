import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RACES, SNAILS } from './data';
import { winsBySnail } from './stats';

const DATA = winsBySnail(SNAILS, RACES);

export function WinsBarChart() {
  return (
    <figure className="chart">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={DATA} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="snail" interval={0} angle={-20} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} domain={[0, 'dataMax']} />
          <Tooltip />
          <Bar dataKey="wins" name="Victorias" fill="#0f6e63" />
        </BarChart>
      </ResponsiveContainer>
      <figcaption>{RACES.length} carreras en el día: cada una tiene un solo ganador.</figcaption>
    </figure>
  );
}