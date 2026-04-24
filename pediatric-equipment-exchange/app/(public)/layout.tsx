// the public landing & logout pages just need the children without sidebar

export default function Layout({ children}: {children: React.ReactNode;}) {
  return (
     <>{children}</>
  )
}