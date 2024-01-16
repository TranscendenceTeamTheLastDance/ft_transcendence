import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface TwoFactorInputs {
    validationCode: string;
}

interface Props {
    username: string;
}

const TwoFactorForm = ({ username }: Props) => {
	const [inputs, setInputs] = useState<TwoFactorInputs>({
		validationCode: "",
	});
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputs({ ...inputs, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const response = await axios.post(
				"http://localhost:8080/auth/validate2fa",
				{ ...inputs, username },
				{ withCredentials: true }
			);
			if (response.data.user) {
				navigate("/home");
			}
		} catch (error: any) {
			setError(error.response?.data.message || "An unknown error occurred");
		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					name="validationCode"
					value={inputs.validationCode}
					onChange={handleChange}
				/>
				<button type="submit">Submit</button>
			</form>
			{error && <p>{error}</p>}
		</div>
	);
};

export default TwoFactorForm;