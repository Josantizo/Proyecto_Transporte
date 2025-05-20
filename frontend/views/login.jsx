// Login.jsx
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        axios.post('http://localhost:3001/login', {
            correo,
            contrasena
        })
        .then(res => {
            const { idLogin, rol, idPasajero_fk } = res.data;
            localStorage.setItem('idLogin', idLogin);
            localStorage.setItem('rol', rol);
            localStorage.setItem('idPasajero_fk', idPasajero_fk);

            if (rol === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/usuario-dashboard');
            }
        })
        .catch(err => {
            alert('Credenciales incorrectas');
            console.log(err);
        });
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="email" placeholder="Correo" onChange={e => setCorreo(e.target.value)} />
            <input type="password" placeholder="Contraseña" onChange={e => setContrasena(e.target.value)} />
            <button onClick={handleLogin}>Iniciar sesión</button>
        </div>
    );
}

export default Login;
