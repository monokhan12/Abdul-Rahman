type TileProps = {
  symbol: string;
  name?: string;
  topLeft?: string;
  topRight?: string;
  meta?: string;
  variant?: 'research' | 'venture';
  size?: 'lg' | 'sm' | 'xs';
  className?: string;
  /** Tiles are decorative next to a real heading; hide them from assistive tech by default. */
  decorative?: boolean;
};

export default function ElementTile({
  symbol,
  name,
  topLeft,
  topRight,
  meta,
  variant = 'research',
  size = 'lg',
  className = '',
  decorative = true,
}: TileProps) {
  const classes = [
    'ar-tile',
    variant === 'venture' ? 'ar-tile--venture' : '',
    size === 'sm' ? 'ar-tile--sm' : '',
    size === 'xs' ? 'ar-tile--xs' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (size === 'xs') {
    return (
      <span className={classes} aria-hidden="true">
        <span className="ar-tile__symbol">{symbol}</span>
      </span>
    );
  }

  return (
    <div className={classes} aria-hidden={decorative || undefined}>
      <div className="ar-tile__top">
        <span>{topLeft}</span>
        <span>{topRight}</span>
      </div>
      <span className="ar-tile__symbol">{symbol}</span>
      <div>
        {name && <div className="ar-tile__name">{name}</div>}
        {meta && <div className="ar-tile__meta">{meta}</div>}
      </div>
    </div>
  );
}
