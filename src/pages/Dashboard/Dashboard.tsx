/**
 * @fileoverview Dashboard Page
 * Main view showing user's footprint overview, trends, and quick actions.
 * @module pages/Dashboard
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarbonContext } from '../../context/CarbonContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { StatCard } from '../../components/molecules/StatCard';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { CarbonInfoModal } from '../../components/atoms/CarbonInfoModal';
import { formatCO2, formatTrend } from '../../utils/formatters';
import { BENCHMARKS } from '../../utils/constants';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts';
import { Calculator, ArrowRight, Leaf, Target, Zap, Info } from 'lucide-react';
import styles from './Dashboard.module.css';

/**
 * Main Dashboard view component.
 * @returns {JSX.Element} The rendered dashboard.
 */
export default function Dashboard() {
  const { state } = useCarbonContext();
  const navigate = useNavigate();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Derived data via custom hook for strict modularity
  const { 
    currentEntry, 
    chartData, 
    categoryData,
    ecoGrade,
    trend
  } = useDashboardData(state);

  // Empty state handling
  if (!currentEntry) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrapper}>
          <Leaf size={48} className={styles.emptyIcon} />
        </div>
        <h1 className={styles.emptyTitle}>Welcome to EcoTrack</h1>
        <p className={styles.emptyDescription}>
          Start your journey to a more sustainable lifestyle by calculating your current carbon footprint.
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
          <p className={styles.subtitle}>Here is your latest footprint overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            variant="ghost" 
            leftIcon={<Info size={18} />}
            onClick={() => setIsInfoModalOpen(true)}
          >
            Understand Equivalents
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Calculator size={18} />}
            onClick={() => navigate('/calculator')}
          >
            Update Footprint
          </Button>
        </div>
      </header>

      {/* Top Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Footprint"
          value={formatCO2(currentTotal)}
          iconName="Globe"
          trend={trend ? {
            ...trend,
            label: 'vs last calculation'
          } : undefined}
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

      {/* Main Content Grid - Track Alignment */}
      <div className={styles.mainGrid}>
        {/* Trend Chart */}
        <Card className={styles.chartCard} padding="lg">
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Track Your Footprint Trend</h2>
          </div>
          <div className={styles.chartContainer} aria-label="Line chart showing your emissions trend over the last 6 months">
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

        {/* Category Breakdown */}
        <Card className={styles.breakdownCard} padding="lg">
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Track Category Breakdown</h2>
          </div>
          <div className={styles.chartContainer} aria-label="Pie chart showing emissions by category">
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
            
            <div className={styles.legend}>
              {categoryData.map((category) => (
                <div key={category.name} className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: category.color }} />
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

      {/* Quick Actions / Navigation */}
      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Take Simple Actions</h2>
        <div className={styles.actionGrid}>
          <Card 
            hoverable 
            className={styles.actionCard} 
            onClick={() => navigate('/recommendations')} 
            role="button" 
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/recommendations'); }}
          >
            <div className={`${styles.actionIcon} ${styles.actionIconPrimary}`}>
              <Zap size={24} />
            </div>
            <div className={styles.actionContent}>
              <h3>Personalized Insights Engine</h3>
              <p>Discover personalized ways to reduce your footprint.</p>
            </div>
            <ArrowRight className={styles.actionArrow} size={20} />
          </Card>
          
          <Card 
            hoverable 
            className={styles.actionCard} 
            onClick={() => navigate('/progress')} 
            role="button" 
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/progress'); }}
          >
            <div className={`${styles.actionIcon} ${styles.actionIconSuccess}`}>
              <Target size={24} />
            </div>
            <div className={styles.actionContent}>
              <h3>Track Your Goals</h3>
              <p>Set targets and monitor your sustainability journey.</p>
            </div>
            <ArrowRight className={styles.actionArrow} size={20} />
          </Card>
        </div>
      </div>

      <CarbonInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
        totalTonnes={currentTotal / 1000} 
      />
    </div>
  );
}
