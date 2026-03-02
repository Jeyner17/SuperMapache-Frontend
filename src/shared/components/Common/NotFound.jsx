import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
      <Link
        to="/dashboard"
        className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Volver al Dashboard
      </Link>
    </div>
  );
};

export default NotFound;