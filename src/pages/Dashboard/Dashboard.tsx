/**
 * @fileoverview Dashboard Page
 * Main view showing user's footprint overview, trends, and quick actions.
 * @module pages/Dashboard
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarbonContext } from '../../context/CarbonContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { StatCard } from '../../components/track/StatCard';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { CarbonInfoModal } from '../../components/understand/CarbonInfoModal';
import { formatCO2, formatTrend } from '../../utils/formatters';
import { BENCHMARKS } from '../../utils/constants';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts';
import { Calculator, ArrowRight, Leaf, Target, Zap, Info } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { state } = useCarbonContext();
  const navigate = useNavigate();
  const [understandModalOpen, setUnderstandModalOpen] = useState(false);

  const trackDashboardData = useDashboardData(state);
  const { currentEntry, chartData, categoryData, ecoGrade, trend } = trackDashboardData;

  if (!currentEntry) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrapper}>
          <Leaf size={48} className={styles.emptyIcon} />
        </div>
        <h1 className={styles.emptyTitle}>Welcome to EcoTrack</h1>
        <p className={styles.emptyDescription} aria-label="App Mission">
          Understand, track, and reduce carbon footprint through simple actions and personalized insights.
        </p>
        <Button 
          size="lg" 
          leftIcon={<Calculator size={20} />}
          onClick={() => navigate('/calculator')}
          className={styles.ctaButton}
        >
          Calculate Footprint
        </Button>
      </div>
    );
  }

  const currentTotal = currentEntry.totalEmissions;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {state.profile.name}</h1>
          <p className={styles.subtitle} aria-label="App Mission">
            Understand, track, and reduce carbon footprint through simple actions and personalized insights.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            variant="ghost" 
            leftIcon={<Info size={18} />}
            onClick={() => setUnderstandModalOpen(true)}
            aria-label="Understand carbon equivalents"
          >
            Pillar 1: Understand
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Calculator size={18} />}
            onClick={() => navigate('/calculator')}
            aria-label="Update footprint calculation"
          >
            Update Footprint
          </Button>
        </div>
      </header>

      <section aria-labelledby="track-heading">
        <h2 id="track-heading" className={styles.sectionTitle} style={{ padding: '0 2rem', marginTop: '1rem' }}>
          Pillar 2: Track Daily Metrics
        </h2>
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Footprint"
            value={formatCO2(currentTotal)}
            iconName="Globe"
            trend={trend ? { ...trend, label: 'vs last calculation' } : undefined}
            info="Your estimated annual CO2 emissions"
          />
          <StatCard
            title="Global Comparison"
            value={`${formatTrend(currentTotal, BENCHMARKS.globalAverage * 1000).value}`}
            description={currentTotal > BENCHMARKS.globalAverage * 1000 ? 'above global average' : 'below global average'}
            iconName="Users"
            colorTheme={currentTotal > BENCHMARKS.globalAverage * 1000 ? 'warning' : 'success'}
          />
          <StatCard
            title="Eco Grade"
            value={ecoGrade ?? 'N/A'}
            description="Based on Paris Agreement targets"
            iconName="Award"
            colorTheme={['A+', 'A', 'B'].includes(ecoGrade ?? '') ? 'success' : 'warning'}
          />
        </div>

        <div className={styles.mainGrid}>
          <Card className={styles.chartCard} padding="lg">
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Track Your Footprint Trend</h3>
            </div>
            <div className={styles.chartContainer} role="figure" aria-label="Line chart showing your emissions trend over the last 6 months">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}kg`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Area type="monotone" dataKey="Total" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className={styles.breakdownCard} padding="lg">
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Track Category Breakdown</h3>
            </div>
            <div className={styles.chartContainer} role="figure" aria-label="Pie chart showing emissions by category">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: unknown) => formatCO2(value as number)}
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className={styles.legend} role="group" aria-label="Category legend">
                {categoryData.map((category) => (
                  <div key={category.name} className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: category.color }} aria-hidden="true" />
                    <div className={styles.legendText}>
                      <span className={styles.legendName}>{category.name}</span>
                      <span className={styles.legendValue}>{Math.round((category.value / currentTotal) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section aria-labelledby="reduce-heading" className={styles.quickActions}>
        <h2 id="reduce-heading" className={styles.sectionTitle}>Pillar 3: Reduce Emissions</h2>
        <div className={styles.actionGrid}>
          <button 
            className={styles.actionCard} 
            onClick={() => navigate('/recommendations')} 
            aria-label="Navigate to personalized insights"
          >
            <div className={`${styles.actionIcon} ${styles.actionIconPrimary}`} aria-hidden="true">
              <Zap size={24} />
            </div>
            <div className={styles.actionContent}>
              <h3>Personalized Insights Engine</h3>
              <p>Discover personalized ways to reduce your footprint.</p>
            </div>
            <ArrowRight className={styles.actionArrow} size={20} aria-hidden="true" />
          </button>
          
          <button 
            className={styles.actionCard} 
            onClick={() => navigate('/progress')} 
            aria-label="Navigate to track goals"
          >
            <div className={`${styles.actionIcon} ${styles.actionIconSuccess}`} aria-hidden="true">
              <Target size={24} />
            </div>
            <div className={styles.actionContent}>
              <h3>Track Your Goals</h3>
              <p>Set targets and monitor your sustainability journey.</p>
            </div>
            <ArrowRight className={styles.actionArrow} size={20} aria-hidden="true" />
          </button>
        </div>
      </section>

      <CarbonInfoModal 
        isOpen={understandModalOpen} 
        onClose={() => setUnderstandModalOpen(false)} 
        totalTonnes={currentTotal / 1000} 
      />
    </div>
  );
}
