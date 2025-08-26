
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from '@/utils/APIUrl.ts';

const DentistDetails = () => {
  const { userId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dentist', userId],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/auth/dentists/${userId}`);
      return response.data.data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading dentist details...</div>;
  }
  if (error) {
    return <div className="text-center text-red-600 py-12">Failed to load dentist details.</div>;
  }
  if (!data) {
    return <div className="text-center text-gray-500 py-12">Dentist not found.</div>;
  }

  const {
    user,
    specialization,
    bio,
    experience,
    phone,
    email,
    address,
    education,
    availability,
    profilePic,
    socials = {},
  } = data;

  
  const { linkedin, twitter, facebook, instagram } = socials || {};

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl mt:14 shadow-lg p-6 md:p-10 mt-8 flex flex-col md:flex-row gap-8 md:gap-12 pt-24 md:pt-28 px-4">
      
      <div className="flex flex-col items-center md:items-start md:w-1/3">
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-4"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-5xl font-bold text-blue-700 mb-4">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-1 text-center md:text-left">{user?.firstName} {user?.lastName}</h2>
        <div className="text-blue-600 font-medium mb-1 text-center md:text-left">{specialization}</div>
        <div className="text-gray-500 text-sm mb-2 text-center md:text-left">{user?.email}</div>
        <div className="flex gap-3 mb-4">
          {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">LinkedIn</a>}
          {twitter && <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Twitter</a>}
          {facebook && <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook</a>}
          {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">Instagram</a>}
        </div>
        <div className=" flex gap-3 w-full justify-center md:justify-start">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium w-40">Message</button>
          <button className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium w-40">Book Appointment</button>
        </div>
      </div>

      
      <div className="flex-1 flex flex-col gap-6">
     
        <div>
          <h3 className="text-lg font-semibold mb-1">Bio</h3>
          <p className="text-gray-700 leading-relaxed">{bio || 'No bio provided.'}</p>
        </div>

        
        <div>
          <h3 className="text-lg font-semibold mb-1">Availability</h3>
          <p className="text-gray-700">{availability || 'Not specified.'}</p>
        </div>

        
        <div>
          <h3 className="text-lg font-semibold mb-1">Education</h3>
          <p className="text-gray-700">{education || 'Not specified.'}</p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Experience:</span> {experience || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {phone || user?.phone || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {email || user?.email || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Address:</span> {address || user?.address || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentistDetails;
