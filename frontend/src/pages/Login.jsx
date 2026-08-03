import "./Login.css";

export default function Login() {

    function login() {

        window.location.href =
            "http://localhost:8000/auth/login/";

    }

    return (

        <div className="login-container">

            <h1>QuickPID</h1>

            <p>Sign in using FAU SSO</p>

            <button onClick={login}>

                Login with FAU

            </button>

        </div>

    );

}