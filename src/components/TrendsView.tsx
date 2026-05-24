import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeadacheEntry } from '@/types/headache';

interface TrendsViewProps {
  entries: HeadacheEntry[];
}

const TrendsView = ({ entries }: TrendsViewProps) => {
  // Monthly intensity data
  const monthlyData = entries.reduce((acc, entry) => {
    const [year, month, day] = entry.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, totalIntensity: 0, count: 0, totalDuration: 0 };
    }
    
    acc[monthKey].totalIntensity += entry.intensity;
    acc[monthKey].count += 1;
    acc[monthKey].totalDuration += entry.duration;
    
    return acc;
  }, {} as Record<string, any>);

  const monthlyChartData = Object.values(monthlyData).map((data: any) => ({
    month: data.month,
    averageIntensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
    episodeCount: data.count,
    totalDuration: data.totalDuration,
  }));

  // Trigger frequency data
  const triggerData = entries
    .flatMap(entry => entry.triggers)
    .reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const triggerChartData = Object.entries(triggerData)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Medication effectiveness (based on average intensity when used)
  const medicationData = entries
    .filter(entry => entry.medications.length > 0)
    .reduce((acc, entry) => {
      entry.medications.forEach(med => {
        if (!acc[med]) {
          acc[med] = { totalIntensity: 0, count: 0 };
        }
        acc[med].totalIntensity += entry.intensity;
        acc[med].count += 1;
      });
      return acc;
    }, {} as Record<string, any>);

  const medicationChartData = Object.entries(medicationData)
    .map(([medication, data]: [string, any]) => ({
      medication,
      averageIntensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
      timesUsed: data.count,
    }))
    .sort((a, b) => a.averageIntensity - b.averageIntensity);

  // Intensity distribution
  const intensityDistribution = entries.reduce((acc, entry) => {
    const range = entry.intensity <= 3 ? 'Leve (1-3)' :
                  entry.intensity <= 6 ? 'Moderado (4-6)' :
                  entry.intensity <= 8 ? 'Severo (7-8)' : 'Extremo (9-10)';
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const intensityPieData = Object.entries(intensityDistribution).map(([range, count]) => ({
    name: range,
    value: count,
  }));

  const COLORS = ['#10B981', '#F59E0B', '#F97316', '#EF4444'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="glass-card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">
              Tendencia Mensual - Intensidad Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #F3E8FF',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="averageIntensity" 
                  stroke="#A855F7" 
                  strokeWidth={3}
                  dot={{ fill: '#A855F7', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Episode Count */}
        <Card className="glass-card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">
              Número de Episodios por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FED7E2" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #FED7E2',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="episodeCount" fill="#FB7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trigger Analysis */}
        <Card className="glass-card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">
              Desencadenantes Más Frecuentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={triggerChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#FECACA" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis 
                  dataKey="trigger" 
                  type="category" 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #FECACA',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#F97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Intensity Distribution */}
        <Card className="glass-card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">
              Distribución de Intensidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={intensityPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {intensityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Medication Effectiveness */}
      {medicationChartData.length > 0 && (
        <Card className="glass-card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">
              Efectividad de Medicamentos (Intensidad Promedio)
            </CardTitle>
            <p className="text-sm text-gray-500">
              Menor intensidad promedio indica mayor efectividad
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={medicationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                <XAxis 
                  dataKey="medication" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E0E7FF',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    `${value}/10`,
                    name === 'averageIntensity' ? 'Intensidad Promedio' : name
                  ]}
                />
                <Bar dataKey="averageIntensity" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrendsView;
