import About from '@/components/About'
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
    </div>
  )
}

export default HomePage
