// src/api/reco.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function fetchRecommendation({ userId, completedCategories, availableActions, stateBucket }) {
  const { data } = await axios.post(`${BASE_URL}/recommend`, {
    user_id: userId,
    completed_categories: completedCategories,
    available_actions: availableActions,
    state_bucket: stateBucket,
  });
  return data; // { recommended_activity, epsilon_used, state }
}

export async function updateQ({ userId, state, action, reward, nextState, availableActions }) {
  await axios.post(`${BASE_URL}/update_q`, {
    user_id: userId,
    state,
    action,
    reward,
    next_state: nextState,
    available_actions: availableActions,
  });
}
