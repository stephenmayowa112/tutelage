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
    
    const { data: { user } } = await supabase.auth.getUser();

    try {
        await supabase.from('schools').insert({ user_id: user.id, school_name, address, contact_email });
        logAdminAction(supabase, (await supabase.auth.getUser()).data.user.id, 'Create School', `Created school ${school_name}`);
        schoolForm.reset();
        createSchoolForm.classList.add('hidden');
        fetchSchools(); // Refresh the list without page reload
    } catch (error) {
        console.error('Error creating school:', error.message);
        alert(`Failed to create school: ${error.message}`);
    }
});

tutorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bio = document.getElementById('tutor-bio').value;
    const subjects = document.getElementById('tutor-subjects').value.split(',').map(s => s.trim());
    const experience_years = parseInt(document.getElementById('tutor-experience').value);
    
    const { data: { user } } = await supabase.auth.getUser();

    try {
        await supabase.from('tutors').insert({ user_id: user.id, bio, subjects, experience_years });
        logAdminAction(supabase, (await supabase.auth.getUser()).data.user.id, 'Create Tutor', `Created tutor with bio: ${bio}`);
        tutorForm.reset();
        createTutorForm.classList.add('hidden');
        fetchTutors(); // Refresh the list without page reload
    } catch (error) {
        console.error('Error creating tutor:', error.message);
        alert(`Failed to create tutor: ${error.message}`);
    }
});

async function fetchSchools() {
    const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('school_name', { ascending: true });

    if (error) {
        console.error('Error fetching schools:', error.message);
        schoolList.innerHTML = `<div class="text-center py-10"><p class="text-red-600">Failed to load schools: ${error.message}</p></div>`;
        return;
    }

    if (!data || data.length === 0) {
        schoolList.innerHTML = '<div class="text-center py-10"><p class="text-gray-500">No schools found.</p></div>';
        return;
    }

    schoolList.innerHTML = data.map(school => `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 px-6 border-b items-center">
            <div class="md:hidden">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="font-semibold text-gray-800 mb-2">${school.school_name}</div>
                    <div class="text-sm text-gray-600 mb-1"><span class="font-medium">Email:</span> ${school.contact_email || 'N/A'}</div>
                    <div class="text-sm text-gray-600 mb-3"><span class="font-medium">Address:</span> ${school.address || 'N/A'}</div>
                    <div class="flex gap-2">
                        <button class="edit-school-btn bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-all" data-school-id="${school.id}">Edit</button>
                        <button class="delete-school-btn bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-all" data-school-id="${school.id}">Delete</button>
                    </div>
                </div>
            </div>
            <div class="hidden md:block truncate">${school.school_name}</div>
            <div class="hidden md:block text-sm text-gray-600 truncate">${school.contact_email || 'N/A'}</div>
            <div class="hidden md:block text-sm text-gray-600 truncate">${school.address || 'N/A'}</div>
            <div class="hidden md:flex gap-2 flex-wrap">
                <button class="edit-school-btn bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-all" data-school-id="${school.id}">Edit</button>
                <button class="delete-school-btn bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-all" data-school-id="${school.id}">Delete</button>
            </div>
        </div>
    `).join('');

    data.forEach(school => {
        // Add listeners for both mobile and desktop buttons
        const editBtns = schoolList.querySelectorAll(`.edit-school-btn[data-school-id='${school.id}']`);
        const deleteBtns = schoolList.querySelectorAll(`.delete-school-btn[data-school-id='${school.id}']`);
        
        editBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const newName = prompt('Edit School Name:', school.school_name);
                const newAddress = prompt('Edit Address:', school.address || '');
                const newEmail = prompt('Edit Contact Email:', school.contact_email || '');
                if (newName && newAddress && newEmail) {
                    await supabase.from('schools').update({ school_name: newName, address: newAddress, contact_email: newEmail }).eq('id', school.id);
                    logAdminAction(supabase, (await supabase.auth.getUser()).data.user.id, 'Edit School', `Edited school ${school.school_name}`);
                    fetchSchools();
                }
            });
        });
        
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm(`Are you sure you want to delete school ${school.school_name}?`)) {
                    await supabase.from('schools').delete().eq('id', school.id);
                    logAdminAction(supabase, (await supabase.auth.getUser()).data.user.id, 'Delete School', `Deleted school ${school.school_name}`);
                    fetchSchools();
                }
            });
        });
    });
}

async function fetchTutors() {
    const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching tutors:', error.message);
        tutorList.innerHTML = `<div class="text-center py-10"><p class="text-red-600">Failed to load tutors: ${error.message}</p></div>`;
        return;
    }

    if (!data || data.length === 0) {
        tutorList.innerHTML = '<div class="text-center py-10"><p class="text-gray-500">No tutors found.</p></div>';
        return;
    }

    tutorList.innerHTML = data.map(tutor => `
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 py-4 px-6 border-b items-center">
            <div class="md:hidden">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-700 mb-2"><span class="font-medium">Bio:</span> ${tutor.bio || 'N/A'}</div>
                    <div class="text-sm text-gray-600 mb-1"><span class="font-medium">Subjects:</span> ${(tutor.subjects || []).join(', ')}</div>
                    <div class="text-sm text-gray-600 mb-1"><span class="font-medium">Experience:</span> ${tutor.experience_years || 0} years</div>
                    <div class="text-xs text-gray-500 mb-3"><span class="font-medium">Created:</span> ${new Date(tutor.created_at).toLocaleDateString()}</div>
                    <div class="flex gap-2">
                        <button class="edit-tutor-btn bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-all" data-tutor-id="${tutor.id}">Edit</button>
                        <button class="delete-tutor-btn bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-all" data-tutor-id="${tutor.id}">Delete</button>
                    </div>
                </div>
            </div>
            <div class="hidden md:block text-sm text-gray-700 truncate">${tutor.bio || 'N/A'}</div>
            <div class="hidden md:block text-sm text-gray-600 truncate">${(tutor.subjects || []).join(', ')}</div>
            <div class="hidden md:block text-sm text-gray-600">${tutor.experience_years || 0} years</div>
            <div class="hidden md:block text-xs text-gray-500">${new Date(tutor.created_at).toLocaleDateString()}</div>
            <div class="hidden md:flex gap-2 flex-wrap">
                <button class="edit-tutor-btn bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-all" data-tutor-id="${tutor.id}">Edit</button>
                <button class="delete-tutor-btn bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-all" data-tutor-id="${tutor.id}">Delete</button>
            </div>
        </div>
    `).join('');

    data.forEach(tutor => {
        // Add listeners for both mobile and desktop buttons
        const editBtns = tutorList.querySelectorAll(`.edit-tutor-btn[data-tutor-id='${tutor.id}']`);
        const deleteBtns = tutorList.querySelectorAll(`.delete-tutor-btn[data-tutor-id='${tutor.id}']`);
        
        editBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const newBio = prompt('Edit Tutor Bio:', tutor.bio || '');
                const newSubjects = prompt('Edit Subjects (comma separated):', (tutor.subjects || []).join(', '));
                const newExp = prompt('Edit Experience Years:', tutor.experience_years || '');
                if (newBio && newSubjects && newExp) {
                    await supabase.from('tutors').update({ bio: newBio, subjects: newSubjects.split(','), experience_years: parseInt(newExp) }).eq('id', tutor.id);
                    logAdminAction(supabase, (await supabase.auth.getUser()).data.user.id, 'Edit Tutor', `Edited tutor ${tutor.id}`);
                    fetchTutors();
                }
            });
        });
        
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm(`Are you sure you want to delete tutor ${tutor.id}?`)) {
                    await supabase.from('tutors').delete().eq('id', tutor.id);
                    logAdminAction(supabase, (await supabase.auth.getUser()).data.user.id, 'Delete Tutor', `Deleted tutor ${tutor.id}`);
                    fetchTutors();
                }
            });
        });
    });
}

'''async function checkUserRole() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        document.body.innerHTML = '<div class="text-center py-20"><h1 class="text-2xl font-bold">Access Denied</h1><p>You must be logged in to view this page.</p></div>';
        return null;
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        document.body.innerHTML = '<div class="text-center py-20"><h1 class="text-2xl font-bold">Access Denied</h1><p>You do not have permission to view this page.</p></div>';
        return null;
    }

    return session.user;
}

async function init() {
    const user = await checkUserRole();
    if (user) {
        fetchSchools();
        fetchTutors();
    }
}

init();'''
