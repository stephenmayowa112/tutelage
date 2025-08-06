
import { supabase } from './supabase-init.js';

document.addEventListener('DOMContentLoaded', async () => {
    const schoolListContainer = document.getElementById('school-list');

    if (!schoolListContainer) {
        console.error('School list container not found.');
        return;
    }

    // Display a loading message
    schoolListContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">Loading schools...</p>';

    try {
        // Fetch data from the 'schools' table
        const { data: schools, error } = await supabase
            .from('schools')
            .select('school_name, address, contact_email');

        if (error) {
            throw error;
        }

        if (schools && schools.length > 0) {
            // Clear the loading message
            schoolListContainer.innerHTML = '';

            // Populate the container with school data
            schools.forEach(school => {
                const schoolCard = `
                    <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300" data-aos="fade-up">
                        <div class="p-6">
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">${school.school_name}</h3>
                            <p class="text-gray-600 mb-4">${school.address || 'Address not available'}</p>
                            ${school.contact_email ? `<a href="mailto:${school.contact_email}" class="text-[#8A2BE1] hover:text-[#5d1a9a] font-semibold">Contact School</a>` : ''}
                        </div>
                    </div>
                `;
                schoolListContainer.insertAdjacentHTML('beforeend', schoolCard);
            });
        } else {
            // Display a message if no schools are found
            schoolListContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">No partner schools listed at the moment. Please check back later.</p>';
        }

    } catch (error) {
        console.error('Error fetching schools:', error.message);
        // Display an error message
        schoolListContainer.innerHTML = '<p class="text-center text-red-600 col-span-full">Failed to load schools. Please try again later.</p>';
    }
});
