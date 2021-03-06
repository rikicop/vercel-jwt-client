import "./app.css";
import axios from "axios";
import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [usrVal, setUsrVal] = useState(false);

  const [usuarios, setUsuarios] = useState([]);
  /* const [loading, setLoading] = useState(false); */
  /*  const [er, setEr] = useState(null); */

  const refreshToken = async () => {
    try {
      const res = await axios.post("/refresh", { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwt_decode(user.accessToken);
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer " + data.accessToken;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/login", { username, password });
      /*  console.log(username, password); */
      setUser(res.data);
    } catch (err) {
      console.log("Tal vez pass o usuario incorrectos", err);
      setUsrVal(true);
    }
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      await axiosJWT.delete("/api/users/" + id, {
        headers: { authorization: "Bearer " + user.accessToken },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };

  const fectchUsuarios = async () => {
    const { data } = await axios.get("http://localhost:5000/api/usuarios");
    setUsuarios(data);
  };

  useEffect(() => {
    fectchUsuarios();
    /*  axios
      .get("http://localhost:5000/api/usuarios")
      .then((res) => {
        console.log("Estatus de Objeto: ", res.statusText);
        console.log(res.data);
        setUsuarios(res.data);
      })
      .catch((err) => console.log(err)); */
  }, []);

  return (
    <div className="container">
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.username}</b>.
          </span>
          <span>Delete Users:</span>
          {usuarios.map((usr) => (
            <button
              className="deleteButton"
              onClick={() => handleDelete(usr.id)}
              key={usr.id}
            >
              Delete {usr.username}
            </button>
          ))}

          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}
        </div>
      ) : (
        <div className="login">
          <form onSubmit={handleSubmit}>
            <span className="formTitle">Lama Login</span>
            <input
              type="text"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submitButton">
              Login
            </button>
          </form>
          {usrVal && <h5>Usuario o Password Incorrectos</h5>}
        </div>
      )}
    </div>
  );
}

export default App;
