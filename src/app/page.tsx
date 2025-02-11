import About from '@/components/About'
import { Footer } from '@/components/footer/footer'
import Hero from '@/components/home'
import NavBar from '@/components/home/Navbar'
import Story from '@/components/home/Story'

const HomePage = () => {
  return (
    <div>
      <NavBar />

      <Hero />
      <About />
      {/* <Features /> */}
      <Story />

      <Footer />
    </div>
  )
}

export default HomePage
