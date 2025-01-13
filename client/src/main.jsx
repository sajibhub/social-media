
import { createRoot } from 'react-dom/client'
import '../public/css/index.css'
import App from './App.jsx'
import {Toaster} from "react-hot-toast";

createRoot(document.getElementById('root')).render(
    <>
        <App/>
        <div>

            <Toaster
                position="bottom-center"
                reverseOrder={false}
            />
        </div>
    </>

)
