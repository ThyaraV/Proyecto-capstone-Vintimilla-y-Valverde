import { Container } from 'react-bootstrap'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import HomeScreenPaciente from './screens/HomeScreenPaciente.jsx'
const App = () => {
  return (
    <>
    <Header/>
    <main className='py-3'>
      <Container>
      <HomeScreenPaciente/>
      </Container>
    </main>
    <Footer/>
    </>
    
  )
}

export default App