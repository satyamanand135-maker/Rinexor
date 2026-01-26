"""
QUICK FIX FOR CIRCULAR IMPORTS
"""
import os

# Fix recovery_model.py
filepath = "app/ml/recovery_model.py"
if os.path.exists(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace the problematic import with direct implementation
    old_code = '''    def _predict_with_rule_based(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based prediction"""
        from app.services.workflow_service import WorkflowService
        
        recovery_score = WorkflowService.calculate_recovery_score(case_data)
        recovery_prob = recovery_score / 100
        
        return {
            'recovery_probability': recovery_prob,
            'recovery_score': recovery_score,
            'confidence': 'medium',
            'key_factors': ['Amount', 'Days Delinquent'],
            'risk_factors': ['Using rule-based fallback'],
            'recommended_action': 'Standard collection process'
        }'''
    
    new_code = '''    def _predict_with_rule_based(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based prediction"""
        recovery_score = self._calculate_rule_based_score(case_data)
        recovery_prob = recovery_score / 100
        
        return {
            'recovery_probability': recovery_prob,
            'recovery_score': recovery_score,
            'confidence': 'medium',
            'key_factors': ['Amount', 'Days Delinquent'],
            'risk_factors': ['Using rule-based fallback'],
            'recommended_action': 'Standard collection process'
        }
    
    def _calculate_rule_based_score(self, case_data: Dict[str, Any]) -> float:
        """Simple rule-based scoring"""
        score = 70.0  # Base score
        
        # Rule 1: Debt age penalty
        days_delinquent = case_data.get("days_delinquent", 0)
        if days_delinquent > 180:
            score -= 40
        elif days_delinquent > 90:
            score -= 25
        elif days_delinquent > 60:
            score -= 15
        elif days_delinquent > 30:
            score -= 5
        
        # Rule 2: Amount penalty
        amount = case_data.get("original_amount", 0)
        if amount > 50000:
            score -= 30
        elif amount > 25000:
            score -= 20
        elif amount > 10000:
            score -= 10
        
        # Ensure score is between 0-100
        return max(0, min(100, round(score, 1)))'''
    
    if old_code in content:
        content = content.replace(old_code, new_code)
        with open(filepath, 'w') as f:
            f.write(content)
        print("✅ Fixed recovery_model.py")
    else:
        print("⚠️  Could not find exact code to replace, checking for similar...")
        
        # Try alternative replacement
        if 'from app.services.workflow_service import WorkflowService' in content:
            # Just remove that line and add the method
            lines = content.split('\n')
            new_lines = []
            for line in lines:
                if 'from app.services.workflow_service import WorkflowService' in line:
                    continue
                new_lines.append(line)
            
            # Add the helper method at the end of the class
            new_content = '\n'.join(new_lines)
            class_end = new_content.find('\n\n', new_content.rfind('class RecoveryModel'))
            if class_end != -1:
                new_content = new_content[:class_end] + '''
    def _calculate_rule_based_score(self, case_data: Dict[str, Any]) -> float:
        """Simple rule-based scoring"""
        score = 70.0  # Base score
        
        # Rule 1: Debt age penalty
        days_delinquent = case_data.get("days_delinquent", 0)
        if days_delinquent > 180:
            score -= 40
        elif days_delinquent > 90:
            score -= 25
        elif days_delinquent > 60:
            score -= 15
        elif days_delinquent > 30:
            score -= 5
        
        # Rule 2: Amount penalty
        amount = case_data.get("original_amount", 0)
        if amount > 50000:
            score -= 30
        elif amount > 25000:
            score -= 20
        elif amount > 10000:
            score -= 10
        
        # Ensure score is between 0-100
        return max(0, min(100, round(score, 1)))''' + new_content[class_end:]
            
            with open(filepath, 'w') as f:
                f.write(new_content)
            print("✅ Fixed import in recovery_model.py")
else:
    print("❌ recovery_model.py not found")

print("\n✅ Run the test again:")
print("   python test_ai_ml.py")