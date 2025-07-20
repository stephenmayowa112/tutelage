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
        jobList.innerHTML = '<p class="text-red-600">Failed to load jobs.</p>';
        return;
    }

    if (!data || data.length === 0) {
        jobList.innerHTML = '<p class="text-gray-500">No job listings found.</p>';
        return;
    }

    jobList.innerHTML = data.map(job => `
        <div class="border-b py-2">
            <div><span class="font-bold">Title:</span> ${job.title}</div>
            <div><span class="font-bold">Location:</span> ${job.location}</div>
            <div><span class="font-bold">Contract:</span> ${job.contract_type || ''}</div>
            <div><span class="font-bold">Description:</span> ${job.description}</div>
            <div><span class="font-bold">Status:</span> ${job.approved ? '<span class="text-green-600">Approved</span>' : '<span class="text-yellow-600">Pending</span>'}</div>
            <div class="flex gap-2 mt-2">
                <button class="approve-btn bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded" data-job-id="${job.id}">${job.approved ? 'Unapprove' : 'Approve'}</button>
                <button class="edit-btn bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded" data-job-id="${job.id}">Edit</button>
                <button class="delete-btn bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded" data-job-id="${job.id}">Delete</button>
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
    await supabase.from('jobs').insert({ title, location, contract_type, description, approved: false });
    logAdminAction(supabase, supabase.auth.user().id, 'Create Job', `Created job ${title}`);
    fetchJobs();
    jobForm.reset();
    createJobForm.classList.add('hidden');
});

fetchJobs();
