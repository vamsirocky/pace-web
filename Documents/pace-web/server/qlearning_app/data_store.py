# server/qlearning_app/data_store.py
from collections import defaultdict


popularity_counts = defaultdict(int)

def incr_popularity(action_id: str) -> None:
    popularity_counts[action_id] += 1

def get_popularity_slice(actions: list[str]) -> dict[str, int]:
    return {a: int(popularity_counts.get(a, 0)) for a in actions}
