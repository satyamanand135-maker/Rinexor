"""
FEATURE ENGINEERING FOR RECOVERY PREDICTION
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime

class FeatureEngineer:
    
    @staticmethod
    def extract_features(case_data: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract meaningful features from raw case data
        """
        features = {}
        
        # 1. Basic financial features
        features['amount_log'] = np.log1p(case_data.get('original_amount', 0))
        features['amount_to_income_ratio'] = case_data.get('debt_to_income', 0.3)  # Mock
        
        # 2. Temporal features
        days_delinquent = case_data.get('days_delinquent', 0)
        features['days_delinquent'] = days_delinquent
        features['delinquency_severity'] = min(days_delinquent / 180, 1.0)  # Cap at 180 days
        
        # 3. Debtor profile features (mock for demo)
        features['credit_score_norm'] = case_data.get('credit_score', 650) / 850
        features['employment_stability'] = case_data.get('employment_months', 24) / 120  # Cap at 10 years
        
        # 4. Behavioral features (mock)
        features['previous_payments'] = case_data.get('previous_payments', 0) / 10  # Cap at 10
        features['communication_responsiveness'] = case_data.get('response_rate', 0.5)  # 0-1
        
        # 5. Debt type encoding
        debt_type = case_data.get('debt_type', 'other')
        debt_type_map = {
            'medical': 0.7,      # High recovery rate
            'credit_card': 0.6,  # Medium recovery
            'personal_loan': 0.5,
            'mortgage': 0.4,     # Lower recovery (secured)
            'auto_loan': 0.3,
            'other': 0.5
        }
        features['debt_type_score'] = debt_type_map.get(debt_type, 0.5)
        
        # 6. Geographic factors (mock)
        features['region_economic_score'] = case_data.get('region_score', 0.6)
        
        # 7. Interaction features
        features['amount_x_delinquency'] = features['amount_log'] * features['delinquency_severity']
        features['credit_x_employment'] = features['credit_score_norm'] * features['employment_stability']
        
        return features
    
    @staticmethod
    def create_feature_dataframe(cases: List[Dict]) -> pd.DataFrame:
        """Convert list of cases to feature dataframe"""
        features_list = []
        
        for case in cases:
            features = FeatureEngineer.extract_features(case)
            features_list.append(features)
        
        return pd.DataFrame(features_list)