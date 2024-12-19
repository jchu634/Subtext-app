import Navbar from './navbar'
 
export default function Layout({ children }) {
  return (
    <>
      
        <main className="flex">
            <Navbar />
            {children}
        </main>
    </>
  )
}