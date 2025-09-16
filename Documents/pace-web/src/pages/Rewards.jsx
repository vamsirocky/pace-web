import './styles/Rewards.css';

const userPoints = 510;

const rewards = [
  { name: "Plant-a-Tree Certificate", cost: 200 },
  { name: "Eco Warrior Badge", cost: 400 },
  { name: "Reusable Bottle", cost: 600 },
  { name: "PACE Hoodie", cost: 800 },
];

export default function Rewards() {
  return (
    <div className="rewards-container">
      <h2>🎁 Available Rewards</h2>
      <p className="points-info">Your Points: <strong>{userPoints}</strong></p>

      <div className="reward-grid">
        {rewards.map((reward, index) => (
          <div key={index} className="reward-card">
            <h3>{reward.name}</h3>
            <p>{reward.cost} pts</p>
            <button disabled={userPoints < reward.cost}>
              {userPoints < reward.cost ? "Not enough points" : "Redeem"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
