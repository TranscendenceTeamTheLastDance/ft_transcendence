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
	const {
		handleSubmit,
		register,
	  } = useForm<TwoFactorInputs>({ mode: 'onTouched', criteriaMode: 'all' });
	  const navigate = useNavigate();
	  const [error, setError] = useState<string | undefined>();
	const onSubmit = async (data: TwoFactorInputs) => {

		try {
			await axios.post(
				`http://${process.env.REACT_APP_SERVER_ADDRESS}:8080/auth/Auth-2FA`, {
				email: mail,
				code: data.validationCode,
				},
				{ withCredentials: true }
			);
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
						<div className="flex items-center justify-between text-center">
						<span className="text-black text-2xl font-bold mx-auto mt-4 text-center">{title}</span> {/* Ajout de la classe font-bold */}
						</div>
						{error && (
                			<p className="error mt-2 text-sm font-bold text-red-600 dark:text-red-500">
                    		Failed to sign in: {error}
                			</p>
            			)}
						<div className="space-y-4 text-center">
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-700">
								Please enter the validation code for two factor authentication
							</p>
							<form onSubmit={handleSubmit(onSubmit)}>
								<div className="flex flex-col items-center mb-4">
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
										className="bg-gray-200 p-2 rounded-md"
									/>
								</div>
								<div className="flex flex-col items-center">
									<button type="submit" className="bg-gray-500 text-white py-2 px-4 rounded-lg text-lg font-bold mx-2">Submit</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default TwoFactorFormMod;