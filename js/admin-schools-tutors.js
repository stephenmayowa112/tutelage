import { supabase } from './supabase-init.js';
import { logAdminAction } from './admin-audit-log.js';

const schoolList = document.getElementById('school-management-list');
const tutorList = document.getElementById('tutor-management-list');
const createSchoolBtn = document.getElementById('create-school-btn');
const createTutorBtn = document.getElementById('create-tutor-btn');
const createSchoolForm = document.getElementById('create-school-form');
const createTutorForm = document.getElementById('create-tutor-form');
const schoolForm = document.getElementById('school-form');
const tutorForm = document.getElementById('tutor-form');

createSchoolBtn.addEventListener('click', () => {
    createSchoolForm.classList.toggle('hidden');
});
createTutorBtn.addEventListener('click', () => {
    createTutorForm.classList.toggle('hidden');
});

schoolForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const school_name = document.getElementById('school-name').value;
    const address = document.getElementById('school-address').value;
    const contact_email = document.getElementById('school-email').value;
    await supabase.from('schools').insert({ school_name, address, contact_email });
    logAdminAction(supabase, supabase.auth.user().id, 'Create School', `Created school ${school_name}`);
    location.reload();
});

tutorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bio = document.getElementById('tutor-bio').value;
    const subjects = document.getElementById('tutor-subjects').value.split(',').map(s => s.trim());
    const experience_years = parseInt(document.getElementById('tutor-experience').value);
    await supabase.from('tutors').insert({ bio, subjects, experience_years });
    logAdminAction(supabase, supabase.auth.user().id, 'Create Tutor', `Created tutor with bio: ${bio}`);
    location.reload();
});

async function fetchSchools() {
    const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('school_name', { ascending: true });

    if (error) {
        schoolList.innerHTML += '<p class="text-red-600">Failed to load schools.</p>';
        return;
    }

    if (!data || data.length === 0) {
        schoolList.innerHTML += '<p class="text-gray-500">No schools found.</p>';
        return;
    }

    schoolList.innerHTML += data.map(school => `
        <div class="border-b py-2">
            <div><span class="font-bold">Name:</span> ${school.school_name}</div>
            <div><span class="font-bold">Address:</span> ${school.address || ''}</div>
            <div><span class="font-bold">Contact Email:</span> ${school.contact_email || ''}</div>
            <div class="flex gap-2 mt-2">
                <button class="edit-school-btn bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded" data-school-id="${school.id}">Edit</button>
                <button class="delete-school-btn bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded" data-school-id="${school.id}">Delete</button>
            </div>
        </div>
    `).join('');

    data.forEach(school => {
        schoolList.querySelector(`.edit-school-btn[data-school-id='${school.id}']`).addEventListener('click', async () => {
            const newName = prompt('Edit School Name:', school.school_name);
            const newAddress = prompt('Edit Address:', school.address || '');
            const newEmail = prompt('Edit Contact Email:', school.contact_email || '');
            if (newName && newAddress && newEmail) {
                await supabase.from('schools').update({ school_name: newName, address: newAddress, contact_email: newEmail }).eq('id', school.id);
                logAdminAction(supabase, supabase.auth.user().id, 'Edit School', `Edited school ${school.school_name}`);
                location.reload();
            }
        });
        schoolList.querySelector(`.delete-school-btn[data-school-id='${school.id}']`).addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete school ${school.school_name}?`)) {
                await supabase.from('schools').delete().eq('id', school.id);
                logAdminAction(supabase, supabase.auth.user().id, 'Delete School', `Deleted school ${school.school_name}`);
                location.reload();
            }
        });
    });
}

async function fetchTutors() {
    const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        tutorList.innerHTML += '<p class="text-red-600">Failed to load tutors.</p>';
        return;
    }

    if (!data || data.length === 0) {
        tutorList.innerHTML += '<p class="text-gray-500">No tutors found.</p>';
        return;
    }

    tutorList.innerHTML += data.map(tutor => `
        <div class="border-b py-2">
            <div><span class="font-bold">Bio:</span> ${tutor.bio || ''}</div>
            <div><span class="font-bold">Subjects:</span> ${(tutor.subjects || []).join(', ')}</div>
            <div><span class="font-bold">Experience:</span> ${tutor.experience_years || ''} years</div>
            <div class="flex gap-2 mt-2">
                <button class="edit-tutor-btn bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded" data-tutor-id="${tutor.id}">Edit</button>
                <button class="delete-tutor-btn bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded" data-tutor-id="${tutor.id}">Delete</button>
            </div>
        </div>
    `).join('');

    data.forEach(tutor => {
        tutorList.querySelector(`.edit-tutor-btn[data-tutor-id='${tutor.id}']`).addEventListener('click', async () => {
            const newBio = prompt('Edit Tutor Bio:', tutor.bio || '');
            const newSubjects = prompt('Edit Subjects (comma separated):', (tutor.subjects || []).join(', '));
            const newExp = prompt('Edit Experience Years:', tutor.experience_years || '');
            if (newBio && newSubjects && newExp) {
                await supabase.from('tutors').update({ bio: newBio, subjects: newSubjects.split(','), experience_years: parseInt(newExp) }).eq('id', tutor.id);
                logAdminAction(supabase, supabase.auth.user().id, 'Edit Tutor', `Edited tutor ${tutor.id}`);
                location.reload();
            }
        });
        tutorList.querySelector(`.delete-tutor-btn[data-tutor-id='${tutor.id}']`).addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete tutor ${tutor.id}?`)) {
                await supabase.from('tutors').delete().eq('id', tutor.id);
                logAdminAction(supabase, supabase.auth.user().id, 'Delete Tutor', `Deleted tutor ${tutor.id}`);
                location.reload();
            }
        });
    });
}

fetchSchools();
fetchTutors();
