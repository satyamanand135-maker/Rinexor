"""
PRIORITY ENGINE - Smart case prioritization
"""
import numpy as np
from typing import Dict, Any, List
from datetime import datetime

class PriorityEngine:
    
    @staticmethod
    def calculate_priority_score(case_data: Dict[str, Any], recovery_prob: float) -> Dict[str, Any]:
        """
        Calculate comprehensive priority score considering:
        1. Recovery probability
        2. Debt amount
        3. Delinquency age
        4. Strategic importance
        5. Resource constraints
        """
        amount = case_data.get('original_amount', 0)
        days_delinquent = case_data.get('days_delinquent', 0)
        
        # 1. Value score (amount weighted)
        value_score = min(amount / 50000, 1.0)  # Normalize to 0-1
        
        # 2. Urgency score (time sensitive)
        urgency_score = min(days_delinquent / 90, 1.0)  # More urgent as older
        
        # 3. Recovery score (from AI model)
        recovery_score = recovery_prob
        
        # 4. Strategic factors (mock)
        debt_type = case_data.get('debt_type', 'other')
        strategic_factors = {
            'medical': 0.8,      # High priority (ethical)
            'credit_card': 0.6,  # Medium
            'mortgage': 0.9,     # High (secured)
            'auto_loan': 0.7,    # Medium-high
            'other': 0.5
        }
        strategic_score = strategic_factors.get(debt_type, 0.5)
        
        # Combined priority score (weighted average)
        weights = {
            'value': 0.3,      # 30% weight to amount
            'urgency': 0.25,   # 25% to delinquency
            'recovery': 0.35,  # 35% to recovery probability
            'strategic': 0.1   # 10% to strategic factors
        }
        
        priority_score = (
            weights['value'] * value_score +
            weights['urgency'] * urgency_score +
            weights['recovery'] * recovery_score +
            weights['strategic'] * strategic_score
        )
        
        # Determine priority level
        if priority_score >= 0.7:
            priority_level = 'high'
            suggested_sla = {'contact': 1, 'resolution': 7}  # days
        elif priority_score >= 0.4:
            priority_level = 'medium'
            suggested_sla = {'contact': 3, 'resolution': 15}
        else:
            priority_level = 'low'
            suggested_sla = {'contact': 5, 'resolution': 30}
        
        # Calculate ROI score (Expected recovery value)
        expected_recovery = amount * recovery_prob
        roi_score = expected_recovery / max(amount, 1)  # Avoid division by zero
        
        return {
            'priority_score': round(priority_score, 3),
            'priority_level': priority_level,
            'value_score': round(value_score, 3),
            'urgency_score': round(urgency_score, 3),
            'recovery_score': round(recovery_score, 3),
            'strategic_score': round(strategic_score, 3),
            'expected_recovery_value': round(expected_recovery, 2),
            'roi_score': round(roi_score, 3),
            'suggested_sla_days': suggested_sla,
            'explanation': PriorityEngine._generate_priority_explanation(
                priority_level, value_score, urgency_score, recovery_score
            )
        }
    
    @staticmethod
    def _generate_priority_explanation(priority_level: str, 
                                      value_score: float, 
                                      urgency_score: float, 
                                      recovery_score: float) -> str:
        """Generate explanation for priority assignment"""
        
        explanations = {
            'high': [
                "High-value account with strong recovery potential",
                "Urgent action required due to delinquency age",
                "Strategic importance for portfolio health"
            ],
            'medium': [
                "Moderate value with reasonable recovery chances",
                "Standard collection timeline appropriate",
                "Balanced risk-reward profile"
            ],
            'low': [
                "Lower expected recovery value",
                "Consider for bulk processing or settlement",
                "Monitor for changes in debtor situation"
            ]
        }
        
        # Select explanation based on dominant factor
        scores = {'value': value_score, 'urgency': urgency_score, 'recovery': recovery_score}
        dominant_factor = max(scores, key=scores.get)
        
        factor_explanations = {
            'value': "Primary driver: High debt amount",
            'urgency': "Primary driver: Age of delinquency",
            'recovery': "Primary driver: Recovery probability"
        }
        
        base_explanation = explanations.get(priority_level, [""])[0]
        factor_explanation = factor_explanations.get(dominant_factor, "")
        
        return f"{base_explanation}. {factor_explanation}"
    
    @staticmethod
    def batch_prioritize(cases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Prioritize multiple cases and rank them
        """
        prioritized_cases = []
        
        for case in cases:
            # Get recovery probability (could be from AI or rule-based)
            recovery_prob = case.get('recovery_probability', 
                                   case.get('recovery_score', 50) / 100)
            
            priority_info = PriorityEngine.calculate_priority_score(case, recovery_prob)
            
            prioritized_case = {
                **case,
                **priority_info
            }
            prioritized_cases.append(prioritized_case)
        
        # Sort by priority score (descending)
        prioritized_cases.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return prioritized_cases