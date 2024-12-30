import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRegisterMutation } from "../slices/usersApiSlice.js";
import { setCredentials } from "../slices/authSlice.js";
import { toast } from "react-toastify";
import "../assets/styles/Login.css"; // Reutiliza el mismo archivo de estilos de Login

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cardId, setCardId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  // Ocultar el navbar en la pantalla de registro
  useEffect(() => {
    document.body.classList.add("no-navbar");
    return () => document.body.classList.remove("no-navbar");
  }, []);

  const validateCedula = (cedula) => {
    if (!/^\d{10}$/.test(cedula)) {
      return false;
    }
    const verificador = parseInt(cedula[9], 10);
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 0 || provincia > 24) return false;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let digito = parseInt(cedula[i], 10) * coeficientes[i];
      if (digito >= 10) digito -= 9;
      suma += digito;
    }
    const modulo = suma % 10;
    const resultadoFinal = modulo === 0 ? 0 : 10 - modulo;
    return resultadoFinal === verificador;
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (
      !name &&
      !lastName &&
      !cardId &&
      !email &&
      !phoneNumber &&
      !password &&
      !confirmPassword
    ) {
      toast.error("No se ha ingresado ningún campo.");
      return;
    }

    if (!name) {
      toast.error("El campo 'Nombre' es obligatorio.");
      return;
    }
    if (!lastName) {
      toast.error("El campo 'Apellido' es obligatorio.");
      return;
    }
    if (!cardId) {
      toast.error("El campo 'Cédula' es obligatorio.");
      return;
    }
    if (!email) {
      toast.error("El campo 'Email' es obligatorio.");
      return;
    }
    if (!phoneNumber) {
      toast.error("El campo 'Teléfono' es obligatorio.");
      return;
    }
    if (!password) {
      toast.error("El campo 'Contraseña' es obligatorio.");
      return;
    }
    if (!confirmPassword) {
      toast.error("El campo 'Confirmar Contraseña' es obligatorio.");
      return;
    }

    if (!validateCedula(cardId)) {
      toast.error(
        "Cédula inválida. Asegúrate de que tenga 10 dígitos y sea coherente."
      );
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await register({
        name,
        lastName,
        cardId,
        email,
        phoneNumber,
        password,
        role: "patient",
        isAdmin: false,
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="register-container">
      <div className="fullscreen-background2"></div>

      <div
        className="register-page"
        style={{
          maxHeight: "80vh",
          overflowY: "auto",
          msOverflowStyle: "none", // IE 10+
          scrollbarWidth: "none", // Firefox
        }}
      >
        <div className="form-wrapper2">
          <div className="form-inner2">
            <h2 id="form-title">Crea una cuenta</h2>
            <form className="form-grid" onSubmit={submitHandler}>
              <div className="form-row">
                <div className="form-column">
                  <label className="input-label">
                    Nombre <span className="required-asterisk">*</span>
                  </label>
                  <input
                    className="input-field2"
                    placeholder="Ingrese su nombre"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <label className="input-label">
                    Apellido <span className="required-asterisk">*</span>
                  </label>
                  <input
                    className="input-field2"
                    placeholder="Ingrese su apellido"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />

                  <label className="input-label">
                    Cédula <span className="required-asterisk">*</span>
                  </label>
                  <input
                    className="input-field2"
                    placeholder="Ingrese su cédula"
                    type="text"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                  />

                  <label className="input-label">
                    Email <span className="required-asterisk">*</span>
                  </label>
                  <input
                    className="input-field2"
                    placeholder="Ingrese su email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-column">
                  <label className="input-label">
                    Teléfono <span className="required-asterisk">*</span>
                  </label>
                  <input
                    className="input-field2"
                    placeholder="Ingrese su número de teléfono"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />

                  <label className="input-label">
                    Contraseña <span className="required-asterisk">*</span>
                  </label>
                  <input
                    className="input-field2"
                    placeholder="Ingrese una contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <label className="input-label">
                    Confirmar Contraseña <span className="required-asterisk">*</span>
                  </label>
                  <input
                    className="input-field2"
                    placeholder="Confirme su contraseña"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Registrando..." : "Registrarse"}
              </button>

              <div className="text-center" style={{ marginTop: "1rem" }}>
                <Link
                  to={redirect ? `/login?redirect=${redirect}` : "/login"}
                  className="link"
                >
                  ¿Ya tienes una cuenta? Iniciar sesión
                </Link>
              </div>
            </form>
          </div>

          <style>
            {`
            .no-navbar header {
                display: none;
            }
            /* Ocultamos la scrollbar en navegadores basados en WebKit (Chrome, Safari, Opera) */
            .register-page::-webkit-scrollbar {
              display: none;
            }
            `}
          </style>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
