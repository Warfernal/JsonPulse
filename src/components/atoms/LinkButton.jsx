function LinkButton({ variant = 'default', className = '', ...props }) {
  const variantClass = variant === 'donate' ? 'link-btn donate-btn' : 'link-btn';
  return <a className={`${variantClass} ${className}`.trim()} {...props} />;
}

export default LinkButton;
