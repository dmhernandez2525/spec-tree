interface SpecTreeLayoutProps {
  children: React.ReactNode;
}

export default function SpecTreeLayout({
  children,
}: SpecTreeLayoutProps) {
  return <div className="spec-tree-layout">{children}</div>;
}
