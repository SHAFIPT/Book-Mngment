
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/Routes';

const App = () => {
  return (
    <div>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AppRoutes />
    </div>
  )
}

export default App
