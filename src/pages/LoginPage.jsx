import {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

export default function LoginPage() {
    const baseUrl = process.env.REACT_APP_APOINT_BASE_URL;
    const [user, setUser] = useState({
        name: "",
        password: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const onChange = (e) => {
        setUser((prevState) => (
            {
                ...prevState,
                [e.target.name]: e.target.value
            }
        ))
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${baseUrl}/hr/user/sign-in?include=token`, {
                username: user.name,
                password: user.password
            })
            console.log(res)
            localStorage.setItem("token", res.data.token.token)
            navigate("/reports")
        } catch (err) {
            setError('Login xato. Iltimos, foydalanuvchi nomi yoki parolni tekshiring.');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-[400px] h-[400px] rounded-[12px] shadow-lg bg-white p-[24px]">
                <h2 className={"font-semibold text-[24px] text-[#222]"}>Login</h2>
                <form className={"flex flex-col gap-[16px] mt-[30px]"} onSubmit={onSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Username"
                        value={user.name}
                        className={"h-[40px] border rounded-[12px] px-[12px] text-[14px] text-[#222]"}
                        onChange={(e) => onChange(e)}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={user.password}
                        className={"h-[40px] border rounded-[12px] px-[12px] text-[14px] text-[#222]"}
                        onChange={(e) => onChange(e)}
                        required
                    />
                    {
                        error &&
                        <p className={"text-red-500 text-[12px]"}>{error}</p>
                    }
                    <button type="submit"
                            className={"font-medium h-[40px] bg-[#5d78ff] text-white rounded-[12px]"}>Login
                    </button>
                </form>
            </div>
        </div>
    );
}

