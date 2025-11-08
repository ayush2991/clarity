document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed.');
    const journalEntriesDiv = document.getElementById('journal-entries');
    const fetchEntriesButton = document.getElementById('fetch-entries-button');

    const API_BASE_URL = 'http://127.0.0.1:8000'; // Assuming backend runs on port 8000

    // Function to fetch and display journal entries
    async function fetchJournalEntries() {
        console.log('Attempting to fetch journal entries...');
        try {
            const response = await fetch(`${API_BASE_URL}/entries`);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} when fetching entries.`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const entries = await response.json();
            console.log('Successfully fetched journal entries:', entries);
            displayJournalEntries(entries);
        } catch (error) {
            console.error('Error fetching journal entries:', error);
            journalEntriesDiv.innerHTML = '<p>Error loading entries. Please ensure the backend server is running.</p>';
        }
    }

    // Function to display entries in the DOM
    function displayJournalEntries(entries) {
        journalEntriesDiv.innerHTML = ''; // Clear existing entries
        if (entries.length === 0) {
            journalEntriesDiv.innerHTML = '<p>No journal entries yet. Click the button to fetch!</p>';
            console.log('No journal entries to display.');
            return;
        }
        console.log(`Displaying ${entries.length} journal entries.`);
        entries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.classList.add('journal-entry');
            entryElement.innerHTML = `
                <h2>${entry.title}</h2>
                <p>${entry.content}</p>
                <small>ID: ${entry.id} | ${new Date(entry.timestamp).toLocaleString()}</small>
            `;
            journalEntriesDiv.appendChild(entryElement);
        });
    }

    // Attach event listener to the new button
    fetchEntriesButton.addEventListener('click', fetchJournalEntries);

    // No initial fetch, only on button click
});