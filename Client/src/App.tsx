import './Styles/App.scss'

import EditStaff from './Components/EditStaff'
import { bindMouse } from './Hooks/Mouse'

function App() {
  bindMouse();
  return (
    <>
      <EditStaff></EditStaff>
    </>
  )
}

export default App
