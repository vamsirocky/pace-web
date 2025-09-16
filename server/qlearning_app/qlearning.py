import math, random

class QLearningAgent:
    def __init__(self, alpha=0.2, gamma=0.9):
        self.q = {}  # (state, action) -> q

    def get_q(self, s, a): return self.q.get((s, a), 0.0)

    def choose(self, s, actions, epsilon=0.1):
        if not actions: return None
        if random.random() < epsilon:
            return random.choice(actions)
        qvals = {a: self.get_q(s, a) for a in actions}
        return max(qvals, key=qvals.get)

    def update(self, s, a, r, s2, actions2):
        max_next = max([self.get_q(s2, a2) for a2 in actions2], default=0.0)
        cur = self.get_q(s, a)
        self.q[(s, a)] = cur + 0.2 * (r + 0.9 * max_next - cur)

def epsilon_decay(n):  # n = per-user step count
    return max(0.05, 0.25 * math.exp(-n / 12.0))
