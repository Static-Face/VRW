document.addEventListener('DOMContentLoaded', () => {
    const addNewLeadBtn = document.getElementById('addNewLeadBtn');
    const addLeadModal = document.getElementById('addLeadModal');
    const closeModal = document.getElementById('closeModal');
    const addLeadForm = document.getElementById('addLeadForm');
    const leadsTableBody = document.querySelector('#leadsTable tbody');
  
    // Show modal on button click
    addNewLeadBtn.addEventListener('click', () => {
      addLeadModal.style.display = 'block';
    });
  
    // Hide modal
    closeModal.addEventListener('click', () => {
      addLeadModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
      if (event.target === addLeadModal) {
        addLeadModal.style.display = 'none';
      }
    });
  
    // Handle form submission
    addLeadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('leadName').value;
      const phone = document.getElementById('leadPhone').value;
      const address = document.getElementById('leadAddress').value;
      const status = document.getElementById('leadStatus').value;
  
      // Insert into table
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${name}</td>
        <td>${phone}</td>
        <td>${address}</td>
        <td>${status}</td>
      `;
      leadsTableBody.appendChild(row);
  
      // Clear form & close modal
      addLeadForm.reset();
      addLeadModal.style.display = 'none';
  
      // Optionally store leads in localStorage or make an API call here
    });
  });
  