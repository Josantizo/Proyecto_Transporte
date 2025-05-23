import React from 'react';
import './Home.css';

const Home = () => (
  <div className="home-container">
    <h1 className="home-title">Bienvenido al Sistema de Transporte</h1>
    <p className="home-subtitle">Gestiona tus solicitudes y tu información de manera fácil y segura.</p>
    <div className="home-cards">
      <div className="home-card">
        <div className="home-icon control">
          <i className="fas fa-user-cog"></i>
        </div>
        <h2>Actualizacón de Usuario</h2>
        <p>
          En esta pestaña podrás actualizar tu <b>dirección</b> y <b>número de teléfono</b>.<br/>
          El sistema te pedirá actualizar tu <b>contraseña</b> después de 3 meses de antigüedad.
        </p>
      </div>
      <div className="home-card">
        <div className="home-icon transport">
          <i className="fas fa-bus"></i>
        </div>
        <h2>Solicitar Mi Transporte</h2>
        <p>
          Aquí podrás solicitar tu transporte, ingresando la <b>fecha</b>, <b>hora</b>, <b>punto de referencia</b> y una <b>dirección alternativa</b> si es necesario.<br />
          <br />
          <b>Horarios:</b><br />
          <ul>
            <li>6:00 am - 2:59 pm: Límite de cancelación hasta las 3 pm.</li>
            <li>3:00 pm - 6:00 pm: Límite de cancelación hasta las 8:30 pm.</li>
          </ul>
          Para otros cambios, sigue las indicaciones del administrador.
        </p>
      </div>
      <div className="home-card">
        <div className="home-icon requests">
          <i className="fas fa-clipboard-list"></i>
        </div>
        <h2>Mis Solicitudes</h2>
        <p>
          Consulta el estado de todas tus solicitudes:<br />
          <ul>
            <li><b>En proceso:</b> Pendiente de aprobación.</li>
            <li><b>Aceptado:</b> Tu transporte ha sido aceptado y aprobado.</li>
            <li><b>Cancelado:</b> Solicitud cancelada por el usuario.</li>
            <li><b>Rechazado:</b> Solicitud rechazada por un administrador (ver comentario).</li>
          </ul>
          También podrás cancelar tu propio transporte desde aquí.
        </p>
      </div>
    </div>
  </div>
);

export default Home; 