import Button from '../atoms/Button';
import LinkButton from '../atoms/LinkButton';
import Logo from '../atoms/Logo';
import NavLinks from '../molecules/NavLinks';

function Header({ theme, onToggleTheme, onOpenEditor, githubUrl, donateUrl }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Logo />
        <NavLinks />
        <div className="nav-actions">
          <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? '☾ Dark' : '☀ Light'}
          </button>
          <LinkButton href={githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </LinkButton>
          <LinkButton variant="donate" href={donateUrl} target="_blank" rel="noreferrer">
            Donate
          </LinkButton>
          <Button onClick={onOpenEditor}>Open editor</Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
