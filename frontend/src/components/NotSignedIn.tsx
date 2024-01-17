import { useNavigate } from 'react-router-dom';
import Particles from './Home/Particles';

function NotConnected({ message }: { message: string }) {
	const navigate = useNavigate();
	return (
		<div className="min-h-screen flex items-center justify-center">
			<Particles className="absolute inset-0 -z-10" quantity={1000} />
			<div className="bg-white rounded-lg p-6 text-center">
				<h2 className="text-3xl font-extrabold text-black dark:text-black">
					You are not signed in...
				</h2>
				<p className="text-gray-600 dark:text-gray-800 mt-4 mb-8">{message}</p>
				<button
					className="bg-gray-500 text-white py-2 px-4 rounded-lg text-lg font-bold"
					onClick={() => {
						navigate('/');
					}}
				>
					Sign In
				</button>
			</div>
		</div>
	);
}

export default NotConnected;
