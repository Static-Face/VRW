document.addEventListener('DOMContentLoaded', () => {
    const openToolButtons = document.querySelectorAll('.open-tool');
    const closeButtons = document.querySelectorAll('.closeBtn');
  
    // Open the correct modal
    openToolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.getAttribute('data-tool');
        const modal = document.getElementById(tool + 'Modal');
        if (modal) {
          modal.style.display = 'block';
        }
      });
    });
  
    // Close modal
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        document.getElementById(target).style.display = 'none';
      });
    });
  
    // Example ROI Calculation
    const roiForm = document.getElementById('roiForm');
    if (roiForm) {
      roiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const renCosts = parseFloat(document.getElementById('renovationCosts').value) || 0;
        const salePrice = parseFloat(document.getElementById('salePrice').value) || 0;
        const totalInvested = purchasePrice + renCosts;
        const profit = salePrice - totalInvested;
        const roi = totalInvested ? ((profit / totalInvested) * 100).toFixed(2) : 0;
        document.getElementById('roiResult').textContent = `Your ROI is ${roi}%`;
      });
    }
  });
  