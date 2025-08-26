import React from 'react';

const mockDentists = [
  {
    id: 1,
    firstName: 'Brian',
    lastName: 'Tanui',
    specialization: 'Orthodontist',
    about: 'Experienced orthodontist with a passion for creating beautiful smiles. Over 10 years in practice.',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    specialization: 'Pediatric Dentist',
    about: 'Gentle and caring pediatric dentist, making dental visits fun and stress-free for kids.',
  },
  {
    id: 3,
    firstName: 'Samuel',
    lastName: 'Kimani',
    specialization: 'Periodontist',
    about: 'Specialist in gum health and dental implants. Committed to patient education and comfort.',
  },
];

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
};

const AvailableDentists = () => {
  return (
    <div className="min-h-[70vh] bg-gray-50 py-8 px-2 md:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">Available Dentists</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {mockDentists.map((dentist) => (
          <div
            key={dentist.id}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
          >
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700 mb-4">
              {getInitials(dentist.firstName, dentist.lastName)}
            </div>
            <div className="mb-2">
              <span className="text-xl font-semibold">
                {dentist.firstName} {dentist.lastName}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-blue-600 font-medium">{dentist.specialization}</span>
            </div>
            <div className="mb-4 text-gray-600 text-sm min-h-[48px]">{dentist.about}</div>
            <div className="flex gap-3 w-full justify-center">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                View More
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium">
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableDentists;
