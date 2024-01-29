import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from 'react-hook-form';

interface TwoFactorInputs {
    validationCode: string;
}

interface Props {
	modalID: string;
    mail: string;
	title: string;
	closeModal: () => void;
}

const TwoFactorFormMod: React.FC<Props> = ({
	modalID,
	mail,
	title,
	closeModal,
}) => {
	console.log("frontend: mail:", mail);
	const {
		handleSubmit,
		register,
	  } = useForm<TwoFactorInputs>({ mode: 'onTouched', criteriaMode: 'all' });
	  const navigate = useNavigate();
	  const [error, setError] = useState<string | undefined>();
	const onSubmit = async (data: TwoFactorInputs) => {

		try {
			const response = await axios.post(
				"http://localhost:8080/auth/Auth-2FA", {
				email: mail,
				code: data.validationCode,
				},
				{ withCredentials: true }
			);
			const userData = response.data;
			console.log("frontend: user data:", userData);
			navigate("/home");
		} catch (error: any) {
			setError(error.response.data.message);
		}
	};


	return (
		<>
			<div
			id={modalID}
			className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none no-scrollbar"
			>	
				<div className="relative w-full max-w-lg max-h-full no-scrollbar">
					<div className="relative bg-white rounded-lg shadow dark:bg-white p-5 space-y-2 no-scrollbar">
						<div className="flex items-center justify-between border-b rounded-t dark:border-gray-600">
							<h3 className="text-xl font-medium text-gray-900 dark:text-black font-bold">
								{title}
							</h3>
							<button
								type="button"
								className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
								onClick={closeModal}
							>
								X
								<span className="sr-only">Close modal</span>
							</button>
						</div>
						{error && (
                			<p className="error mt-2 text-sm font-bold text-red-600 dark:text-red-500">
                    		Failed to sign in: {error}
                			</p>
            			)}
						<div className="space-y-4">
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-700">
								Please enter the validation code for two factor authentication
							</p>
							<form onSubmit={handleSubmit(onSubmit)}>
								<input
								    {...register('validationCode', {
										required: 'This field is required',
										pattern: {
										  value: /^\d{6}$/,
										  message: 'Must be a 6-digit code with only digits.',
										},
									})}
									type="text"
									name="validationCode"
								/>
								<button type="submit">Submit</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default TwoFactorFormMod;