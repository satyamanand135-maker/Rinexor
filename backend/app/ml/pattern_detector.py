"""
PATTERN DETECTOR - Identify trends and anomalies
"""
import numpy as np
from typing import Dict, Any, List, Tuple
from datetime import datetime, timedelta
import pandas as pd

class PatternDetector:
    
    @staticmethod
    def detect_recovery_patterns(cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Detect patterns in case data for insights
        """
        if not cases:
            return {"patterns": [], "insights": []}
        
        df = pd.DataFrame(cases)
        
        patterns = []
        insights = []
        
        # 1. Amount distribution pattern
        if 'original_amount' in df.columns:
            mean_amount = df['original_amount'].mean()
            std_amount = df['original_amount'].std()
            
            if std_amount > mean_amount * 0.5:
                patterns.append({
                    'type': 'amount_variability',
                    'description': 'High variability in debt amounts',
                    'severity': 'medium',
                    'action': 'Segment cases by amount brackets'
                })
        
        # 2. Delinquency trend
        if 'days_delinquent' in df.columns:
            avg_delinquency = df['days_delinquent'].mean()
            if avg_delinquency > 90:
                insights.append({
                    'type': 'aging_portfolio',
                    'description': f'Average delinquency is {avg_delinquency:.0f} days',
                    'impact': 'Reduces overall recovery rate',
                    'recommendation': 'Focus on newer delinquencies first'
                })
        
        # 3. Recovery score distribution
        if 'recovery_score' in df.columns:
            high_recovery = len(df[df['recovery_score'] > 70])
            low_recovery = len(df[df['recovery_score'] < 30])
            
            if high_recovery > low_recovery * 2:
                patterns.append({
                    'type': 'recovery_optimism',
                    'description': f'More high-recovery cases ({high_recovery}) than low ({low_recovery})',
                    'severity': 'low',
                    'action': 'Allocate resources to capitalize on high-probability cases'
                })
        
        # 4. DCA performance correlation
        if 'dca_id' in df.columns and 'recovery_score' in df.columns:
            dca_performance = df.groupby('dca_id')['recovery_score'].mean()
            performance_std = dca_performance.std()
            
            if performance_std > 15:  # High variance in DCA performance
                patterns.append({
                    'type': 'dca_performance_disparity',
                    'description': 'Significant variation in DCA recovery rates',
                    'severity': 'high',
                    'action': 'Review allocation strategy and DCA training'
                })
        
        # 5. Temporal patterns (if dates available)
        if 'created_at' in df.columns:
            try:
                df['created_at'] = pd.to_datetime(df['created_at'])
                weekly_trend = df['created_at'].dt.isocalendar().week.value_counts()
                
                if len(weekly_trend) > 0 and weekly_trend.std() > weekly_trend.mean() * 0.3:
                    patterns.append({
                        'type': 'seasonal_intake',
                        'description': 'Uneven case intake throughout the month',
                        'severity': 'medium',
                        'action': 'Plan resource allocation for peak periods'
                    })
            except:
                pass
        
        return {
            'patterns_detected': len(patterns),
            'patterns': patterns[:5],  # Top 5 patterns
            'insights': insights[:5],   # Top 5 insights
            'summary': PatternDetector._generate_summary(patterns, insights)
        }
    
    @staticmethod
    def _generate_summary(patterns: List[Dict], insights: List[Dict]) -> str:
        """Generate executive summary"""
        if not patterns and not insights:
            return "No significant patterns detected in current data."
        
        high_severity = sum(1 for p in patterns if p.get('severity') == 'high')
        medium_severity = sum(1 for p in patterns if p.get('severity') == 'medium')
        
        summary = f"Detected {len(patterns)} patterns and {len(insights)} insights. "
        
        if high_severity > 0:
            summary += f"{high_severity} high-severity patterns require immediate attention. "
        
        if medium_severity > 0:
            summary += f"{medium_severity} medium-severity patterns suggest optimization opportunities. "
        
        if insights:
            summary += f"Key insight: {insights[0].get('description', '')}"
        
        return summary
    
    @staticmethod
    def predict_batch_recovery(cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict aggregate recovery for a batch of cases
        """
        if not cases:
            return {"total_recovery": 0, "confidence": "low"}
        
        df = pd.DataFrame(cases)
        
        # Calculate expected recovery
        if 'original_amount' in df.columns and 'recovery_score' in df.columns:
            df['expected_recovery'] = df['original_amount'] * (df['recovery_score'] / 100)
            total_expected = df['expected_recovery'].sum()
            total_amount = df['original_amount'].sum()
            recovery_rate = (total_expected / total_amount * 100) if total_amount > 0 else 0
            
            # Calculate confidence
            score_std = df['recovery_score'].std()
            if score_std < 15:
                confidence = 'high'
            elif score_std < 30:
                confidence = 'medium'
            else:
                confidence = 'low'
            
            return {
                'total_cases': len(cases),
                'total_amount': round(total_amount, 2),
                'expected_recovery': round(total_expected, 2),
                'expected_recovery_rate': round(recovery_rate, 1),
                'confidence': confidence,
                'best_case_scenario': round(total_expected * 1.2, 2),  # +20%
                'worst_case_scenario': round(total_expected * 0.8, 2)  # -20%
            }
        
        return {"error": "Insufficient data for prediction"}