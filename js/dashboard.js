document.addEventListener('DOMContentLoaded', () => {
    // Example: Data you could retrieve from an API or local storage
    const newLeads = 3;
    const dealsUnderContract = 2;
    const closedDeals = 1;
    const totalBuyers = 15;

    document.getElementById('newLeadsCount').textContent = newLeads;
    document.getElementById('underContractCount').textContent = dealsUnderContract;
    document.getElementById('closedDealsCount').textContent = closedDeals;
    document.getElementById('totalBuyersCount').textContent = totalBuyers;

    // Dynamically add recent activities
    const activities = [
      "Called lead: Joe Johnson",
      "Negotiated offer with seller",
      "Contract closed on 123 Main St"
    ];
    const activityList = document.getElementById('activityList');
    activities.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      activityList.prepend(li); // add to top of list
    });

    // Sidebar toggle logic
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');

    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar-open');
    });
  });