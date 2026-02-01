import Button from '../atoms/Button';
import HeroStats from '../molecules/HeroStats';

function Hero({ onOpenEditor, onLoadExample, githubUrl, donateUrl }) {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <span className="hero-tag">JSON → Excel • Graph • Tree</span>
        <h1>Turn JSON into insight, not guesswork.</h1>
        <p>
          JsonPulse lets you explore complex JSON like a map, switch between graph and tree views,
          then export clean Excel reports in seconds — all in your browser.
        </p>
        <div className="hero-actions">
          <Button onClick={onOpenEditor}>Try the editor</Button>
          <Button variant="secondary" onClick={onLoadExample}>Load example</Button>
        </div>
        <div className="hero-links">
          <a href={githubUrl} target="_blank" rel="noreferrer">Open-source on GitHub</a>
          <span>•</span>
          <a href={donateUrl} target="_blank" rel="noreferrer">Support the project</a>
        </div>
        <HeroStats />
      </div>
      <div className="hero-preview">
        <div className="preview-card">
          <div className="preview-header">Live preview</div>
          <pre className="preview-code">
{`{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "metadata": { "total": 2 }
}`}
          </pre>
          <div className="preview-footer">Graph & tree rendering ready</div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
