// JS for admin Transactions page
function logout() {
    if (confirm('Logout?')) window.location.href = 'login.html';
}

function filterTransactions(q) {
    q = q.trim().toLowerCase();
    const rows = document.querySelectorAll('#transactionsTable tr');
    rows.forEach(r => {
        if (r.classList.contains('empty-row')) return;
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
    });
}

function filterByType(type) {
    const rows = document.querySelectorAll('#transactionsTable tr');
    rows.forEach(r => {
        if (r.classList.contains('empty-row')) return;
        if (!type) { r.style.display = ''; return; }
        const c = r.cells[2];
        if (!c) return;
        r.style.display = c.textContent.toLowerCase().includes(type) ? '' : 'none';
    });
}

// REMOVED: function addTransaction() { alert('Open modal to add a transaction (not implemented).'); }

// optional: wire the search input to the function for immediate UX
document.addEventListener('DOMContentLoaded', function(){
    const search = document.getElementById('txnSearch');
    if (search) search.addEventListener('input', e => filterTransactions(e.target.value));

    const type = document.getElementById('txnType');
    if (type) type.addEventListener('change', e => filterByType(e.target.value));
});

/* Generic helpers used across admin pages */
function filterTableByQuery(tableBodyId, q) {
    q = (q || '').trim().toLowerCase();
    const rows = document.querySelectorAll(`#${tableBodyId} tr`);
    rows.forEach(r => {
        if (r.classList.contains('empty-row')) return;
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
    });
}

function filterTableByColumn(tableBodyId, columnIndex, value) {
    const rows = document.querySelectorAll(`#${tableBodyId} tr`);
    rows.forEach(r => {
        if (r.classList.contains('empty-row')) return;
        if (!value) { r.style.display = ''; return; }
        const c = r.cells[columnIndex];
        if (!c) return;
        r.style.display = c.textContent.toLowerCase().includes(value.toLowerCase()) ? '' : 'none';
    });
}

/* Wrappers for existing pages to call */
function filterInventory(q){ filterTableByQuery('inventoryTable', q); }
function filterInventoryByStatus(status){ filterTableByColumn('inventoryTable', 4, status); }
function filterLogs(q){ filterTableByQuery('logsTable', q); }
function filterByAction(action){ filterTableByColumn('logsTable', 2, action); }

function addItem(){ alert('Add Item functionality goes here!'); }

/* Wire common inputs if present on a page */
document.addEventListener('DOMContentLoaded', function(){
    const invSearch = document.getElementById('invSearch');
    if (invSearch) invSearch.addEventListener('input', e => filterInventory(e.target.value));

    const invFilter = document.getElementById('invFilter');
    if (invFilter) invFilter.addEventListener('change', e => filterInventoryByStatus(e.target.value));

    const logsSearch = document.querySelector('#logsTable') ? document.querySelector('.search-input input') : null;
    if (logsSearch) logsSearch.addEventListener('input', e => filterLogs(e.target.value));
});

/* Modal helpers and submission handlers */
function openModal(id){
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('active'); // Adds the 'active' class (which uses display: flex;)
    m.querySelector('input,select,textarea')?.focus();
}

function closeModal(id){
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('active'); // Removes the 'active' class (which returns it to display: none;)
}

/* Transactions */
// REMOVED: function openTransactionModal(){ openModal('modal-transaction'); }
// REMOVED: async function submitTransaction(ev){...}

/* Inventory */
function openInventoryModal(){ openModal('modal-inventory'); }

async function submitInventoryItem(ev){
    ev && ev.preventDefault();
    const f = document.getElementById('inventoryForm');
    if (!f) return;
    const data = {
        item_name: f.item_name.value,
        category: f.category.value,
        current_stock: f.current_stock.value,
        unit: f.unit.value,
        status: f.status.value
    };
    try{
        const res = await fetch('../php/add_inventory_item.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
        const j = await res.json();
        if (j.success){
            const t = document.getElementById('inventoryTable');
            if (t){
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${j.record.item_id}</td><td>${j.record.item_name}</td><td>${j.record.category}</td><td>${j.record.current_stock}</td><td>${j.record.unit}</td><td><span class="status-badge status-${j.record.status||'normal'}">${j.record.status||'normal'}</span></td>`;
                const empty = t.querySelector('tr'); if (empty && empty.querySelector('.empty-state')) empty.remove();
                t.prepend(tr);
            }
            closeModal('modal-inventory'); f.reset(); alert('Inventory item added');
        } else alert(j.message||'Save failed');
    }catch(err){ console.error(err); alert('Network error'); }
}

/* Patients */
function openPatientModal(){ openModal('modal-patient'); }

async function submitPatient(ev){
    ev && ev.preventDefault();
    const f = document.getElementById('patientForm');
    if (!f) return;
    const data = {
        patient_name: f.patient_name.value,
        dob: f.dob.value,
        gender: f.gender.value,
        contact: f.contact.value,
        address: f.address.value
    };
    try{
        const res = await fetch('../php/register_patient.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
        const j = await res.json();
        if (j.success){ closeModal('modal-patient'); f.reset(); alert('Patient registered'); }
        else alert(j.message||'Save failed');
    }catch(err){ console.error(err); alert('Network error'); }
}

/* attach modal submit handlers */
document.addEventListener('DOMContentLoaded', function(){
    // REMOVED: const tf = document.getElementById('transactionForm'); if (tf) tf.addEventListener('submit', submitTransaction);
    const inf = document.getElementById('inventoryForm'); if (inf) inf.addEventListener('submit', submitInventoryItem);
    const pf = document.getElementById('patientForm'); if (pf) pf.addEventListener('submit', submitPatient);
});