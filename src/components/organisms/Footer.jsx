function Footer({ githubUrl, donateUrl }) {
  return (
    <footer className="footer">
      <div>Private by design — everything runs in your browser.</div>
      <div className="footer-links">
        <a href={githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <span>·</span>
        <a href={donateUrl} target="_blank" rel="noreferrer">
          Donate
        </a>
        <span>·</span>
        <span>Inspired by JsonCrack and JsonLens</span>
      </div>
    </footer>
  );
}

export default Footer;
