import { supabase } from './supabase-init.js';
import { logAdminAction } from './admin-audit-log.js';

const jobList = document.getElementById('job-management-list');
const createJobBtn = document.getElementById('create-job-btn');
const createJobForm = document.getElementById('create-job-form');
const jobForm = document.getElementById('job-form');

createJobBtn.addEventListener('click', () => {
    createJobForm.classList.toggle('hidden');
});

async function fetchJobs() {
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        jobList.innerHTML = '<div class="text-center py-10"><p class="text-red-600">Failed to load jobs.</p></div>';
        return;
    }

    if (!data || data.length === 0) {
        jobList.innerHTML = '<div class="text-center py-10"><p class="text-gray-500">No job listings found.</p></div>';
        return;
    }

    jobList.innerHTML = data.map(job => `
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4 py-4 px-6 border-b items-center">
            <div class="md:hidden">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="font-semibold text-gray-800 mb-2">${job.title}</div>
                    <div class="text-sm text-gray-600 mb-1"><span class="font-medium">Location:</span> ${job.location}</div>
                    <div class="text-sm text-gray-600 mb-1"><span class="font-medium">Contract:</span> ${job.contract_type || 'N/A'}</div>
                    <div class="text-sm text-gray-600 mb-1"><span class="font-medium">Posted:</span> ${new Date(job.created_at).toLocaleDateString()}</div>
                    <div class="mb-3">
                        <span class="inline-block px-2 py-1 rounded-full text-xs font-medium ${job.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                            ${job.approved ? 'Approved' : 'Pending'}
                        </span>
                    </div>
                    <div class="flex gap-2 flex-wrap">
                        <button class="approve-btn ${job.approved ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs px-3 py-1 rounded transition-all" data-job-id="${job.id}">
                            ${job.approved ? 'Unapprove' : 'Approve'}
                        </button>
                        <button class="edit-btn bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-all" data-job-id="${job.id}">Edit</button>
                        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-all" data-job-id="${job.id}">Delete</button>
                    </div>
                </div>
            </div>
            <div class="hidden md:block font-medium text-gray-800 truncate">${job.title}</div>
            <div class="hidden md:block text-sm text-gray-600 truncate">${job.location}</div>
            <div class="hidden md:block text-sm text-gray-600">${job.contract_type || 'N/A'}</div>
            <div class="hidden md:block text-xs text-gray-500">${new Date(job.created_at).toLocaleDateString()}</div>
            <div class="hidden md:block">
                <span class="inline-block px-2 py-1 rounded-full text-xs font-medium ${job.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${job.approved ? 'Approved' : 'Pending'}
                </span>
            </div>
            <div class="hidden md:flex gap-2 flex-wrap">
                <button class="approve-btn ${job.approved ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs px-3 py-1 rounded transition-all" data-job-id="${job.id}">
                    ${job.approved ? 'Unapprove' : 'Approve'}
                </button>
                <button class="edit-btn bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-all" data-job-id="${job.id}">Edit</button>
                <button class="delete-btn bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-all" data-job-id="${job.id}">Delete</button>
            </div>
        </div>
    `).join('');

    // Add event listeners for approve, edit, delete
    data.forEach(job => {
        jobList.querySelector(`.approve-btn[data-job-id='${job.id}']`).addEventListener('click', async () => {
            await supabase.from('jobs').update({ approved: !job.approved }).eq('id', job.id);
            logAdminAction(supabase, supabase.auth.user().id, job.approved ? 'Unapprove Job' : 'Approve Job', `${job.approved ? 'Unapproved' : 'Approved'} job ${job.title}`);
            fetchJobs();
        });
        jobList.querySelector(`.edit-btn[data-job-id='${job.id}']`).addEventListener('click', async () => {
            const newTitle = prompt('Edit Job Title:', job.title);
            const newLocation = prompt('Edit Location:', job.location);
            const newContract = prompt('Edit Contract Type:', job.contract_type || '');
            const newDescription = prompt('Edit Description:', job.description);
            if (newTitle && newLocation && newContract && newDescription) {
                await supabase.from('jobs').update({ title: newTitle, location: newLocation, contract_type: newContract, description: newDescription }).eq('id', job.id);
                logAdminAction(supabase, supabase.auth.user().id, 'Edit Job', `Edited job ${job.title}`);
                fetchJobs();
            }
        });
        jobList.querySelector(`.delete-btn[data-job-id='${job.id}']`).addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete job ${job.title}?`)) {
                await supabase.from('jobs').delete().eq('id', job.id);
                logAdminAction(supabase, supabase.auth.user().id, 'Delete Job', `Deleted job ${job.title}`);
                fetchJobs();
            }
        });
    });
}

jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('job-title').value;
    const location = document.getElementById('job-location').value;
    const contract_type = document.getElementById('job-contract').value;
    const description = document.getElementById('job-description').value;
    const salary = document.getElementById('job-salary').value;
    
    try {
        await supabase.from('jobs').insert({ 
            title, 
            location, 
            contract_type, 
            description, 
            salary_range: salary,
            approved: false 
        });
        logAdminAction(supabase, supabase.auth.user().id, 'Create Job', `Created job ${title}`);
        fetchJobs();
        jobForm.reset();
        createJobForm.classList.add('hidden');
    } catch (error) {
        console.error('Error creating job:', error);
        alert('Failed to create job. Please try again.');
    }
});

fetchJobs();
