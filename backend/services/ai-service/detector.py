# plagiarism-service/detector.py
from codebleu import calc_codebleu

class PlagiarismDetector:
    def __init__(self):
        self.threshold = 0.85  # 85% similarity
    
    def compare(self, code1, code2):
        score = calc_codebleu([code1], [code2], lang="python")
        return score['codebleu'] > self.threshold