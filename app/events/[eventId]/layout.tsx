interface EventLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function EventLayout({ children, modal }: EventLayoutProps) {
  return (
    <div className="relative">
      {children}
      {modal}
    </div>
  );
}
