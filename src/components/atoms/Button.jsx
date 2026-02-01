function Button({ variant = 'primary', className = '', ...props }) {
  const variantClass =
    {
      primary: 'primary-btn',
      secondary: 'secondary-btn',
      ghost: 'ghost-btn',
    }[variant] || 'primary-btn';

  return <button className={`${variantClass} ${className}`.trim()} {...props} />;
}

export default Button;
