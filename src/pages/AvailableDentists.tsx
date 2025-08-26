
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from '@/utils/APIUrl.ts';
import { useNavigate } from 'react-router-dom';


const getInitials = (firstName: string, lastName: string) => {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
};

const AvailableDentists = () => {
    const navigate = useNavigate();
const { data, isLoading, error } = useQuery({
    queryKey: ['dentists'],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/auth/dentists`);
      console.log(response.data);
      return response.data.data;
    },
  });
  






  return (
    <div className="min-h-[70vh] bg-gray-50 py-8 px-2 md:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">Available Dentists</h1>
      {isLoading ? (
        <div className="text-center text-lg py-12">Loading dentists...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-12">Failed to load dentists. Please try again later.</div>
      ) : !data || data.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No dentists available at the moment.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {data.map((dentist) => (
            <div
              key={dentist.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700 mb-4">
                {getInitials(dentist.user?.firstName || '', dentist.user?.lastName || '')}
              </div>
              <div className="mb-2">
                <span className="text-xl font-semibold">
                  {dentist.user?.firstName} {dentist.user?.lastName}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-blue-600 font-medium">{dentist.specialization}</span>
              </div>
              <div className="mb-4 text-gray-600 text-sm min-h-[48px]">{dentist.bio}</div>
              <div className="flex gap-3 w-full justify-center">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  onClick={() => navigate(`/dentists/${dentist.userId}`)}
                >
                  View More
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium">
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableDentists;
