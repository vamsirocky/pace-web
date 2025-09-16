import '../styles/WildlifePage.css';
import wildlifeImage from '/src/assets/wildlife.jpg'; 

export default function WildlifePage() {
  return (
    <div className="wildlife-container">
      <h1 className="wildlife-title">🦁 Protect Wildlife</h1>

      <div className="wildlife-image-container">
        <img src={wildlifeImage} alt="Wildlife Conservation" className="wildlife-image" />
      </div>

      <div className="wildlife-description">
        <p>Wildlife conservation is essential to maintaining biodiversity and preserving natural habitats. Our actions today determine the future of countless species and ecosystems.</p>

        <p>Join us in our mission to protect and nurture wildlife for generations to come. Small actions make a big difference!</p>

        <ul>
          <li> Reduce pollution</li>
          <li> Support sustainable practices</li>
          <li> Advocate for stronger environmental protection laws</li>
        </ul>

        <p>Together, we can ensure a safe and thriving planet for all living creatures!</p>
      </div>
    </div>
  );
}
