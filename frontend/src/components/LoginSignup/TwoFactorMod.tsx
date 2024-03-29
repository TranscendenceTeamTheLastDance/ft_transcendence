import React from "react";
import { useForm } from 'react-hook-form';
import { motion } from "framer-motion";

interface Props {
  error?: string | undefined;
  modalId: string;
  qrCodeDataUrl?: string | undefined;
  secret?: string | undefined;
  title: string;
  closeModal: () => void;
  onSubmit: (data: ModalInputs) => void;
}

export type ModalInputs = {
  validationCode: string; // Change the type to string
};

const TwoFactorMod: React.FC<Props> = ({
  error = undefined,
  modalId,
  qrCodeDataUrl = undefined,
  secret = undefined,
  title,
  closeModal,
  onSubmit,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ModalInputs>({ mode: 'onTouched', criteriaMode: 'all' });

  return (
    <>
      <div
        id={modalId}
        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none no-scrollbar"
      >
        <div className="relative w-full max-w-lg max-h-full no-scrollbar">
          <div className="relative bg-white rounded-lg shadow dark:bg-white p-5 space-y-2 no-scrollbar">
            <div className="flex items-center justify-between text-center">
                <span className="text-black text-2xl font-bold mx-auto mt-2 mb-6 text-center">{title}</span> {/* Ajout de la classe font-bold */}
              <motion.button
                type="button"
                className="text-white bg-gray-500 hover:bg-transparent hover:text-gray-500 border border-gray-500 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-200 dark:hover:text-gray-900 mt-2 mb-6"
                onClick={closeModal} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
              >
                X
                <span className="sr-only">Close modal</span>
              </motion.button>
            </div>
            {qrCodeDataUrl && (
              <div className="space-y-4 text-center "> {/* Ajout de la classe text-center */}
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-700">
                  Scan the QR code to register the app
                </p>
                <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto" /> {/* Ajout de la classe mx-auto pour centrer l'image */}
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-700 mb-9">
                  If you can't scan the QR code, type the following secret key in the app: {secret}
                </p>
              </div>
            )}
            <form
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {error && (
                <p className="error mt-2 text-sm font-bold text-red-600 dark:text-red-500">
                  {qrCodeDataUrl
                    ? 'Impossible to enable two factor authentication: '
                    : 'Impossible to disable two factor authentication: '}
                  {error}
                </p>
              )}
              {/* Input field for the 6-digit code */}
              <div className="flex flex-col items-center">
                <label htmlFor="validationCode" className="font-bold">Enter the 6 digits code </label>
                <input
                  {...register('validationCode', {
                    required: 'This field is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Must be a 6-digit code with only digits.',
                    },
                  })}
                  type="text"
                  id="validationCode"
                  name="validationCode"
                  className="bg-gray-200 p-2 rounded-md"
                />
              </div>
              {errors.validationCode && (
                <p className="error text-sm font-bold text-red-600 dark:text-red-500 text-center">
                  {errors.validationCode.message}
                </p>
              )}
              <div className="flex flex-col items-center">
                <motion.button type="submit" className="bg-gray-500 text-white py-2 px-4 rounded-lg text-lg font-bold mx-2" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}>
                  {qrCodeDataUrl ? 'Enable' : 'Disable'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};

export default TwoFactorMod;