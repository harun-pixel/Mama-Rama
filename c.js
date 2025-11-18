document.addEventListener('DOMContentLoaded', () => {
    // CONFIG
    const CONFIG = {
      waNumber: '6289515517188', // ganti jika perlu (hanya digit, tanpa +)
      deliveryFee: 5000,
      isOpen: true // set ke false untuk menutup layanan (banner tampil, submit disabled)
    };
  
    // ELEMENTS
    const closedBanner = document.getElementById('closedBanner');
    const mapsLink = document.getElementById('mapsLink');
    const customerRadios = document.querySelectorAll('input[name="customerType"]');
    const roomWrap = document.getElementById('roomWrap');
    const addressWrap = document.getElementById('addressWrap');
    const roomNo = document.getElementById('roomNo');
    const fullAddress = document.getElementById('fullAddress');
    const custName = document.getElementById('custName');
    const custWa = document.getElementById('custWa');
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsContainer = document.getElementById('itemsContainer');
    const submitBtn = document.getElementById('submitBtn');
    const notification = document.getElementById('notification');
  
    // OPEN/CLOSE
    function renderOpenClose() {
      if (!CONFIG.isOpen) {
        closedBanner.classList.remove('hidden');
        submitBtn.disabled = true;
        submitBtn.style.opacity = 0.6;
        submitBtn.style.cursor = 'not-allowed';
      } else {
        closedBanner.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.style.opacity = 1;
        submitBtn.style.cursor = 'pointer';
      }
    }
    renderOpenClose();
  
    // CUSTOMER TYPE TOGGLE
    customerRadios.forEach(r => {
      r.addEventListener('change', (e) => {
        if (e.target.value === 'penghuni') {
          roomWrap.classList.remove('hidden');
          addressWrap.classList.add('hidden');
          roomNo.setAttribute('required','required');
          fullAddress.removeAttribute('required');
        } else {
          roomWrap.classList.add('hidden');
          addressWrap.classList.remove('hidden');
          fullAddress.setAttribute('required','required');
          roomNo.removeAttribute('required');
        }
      });
    });
  
    // CATEGORY CHIPS
    const CHIPS = {
      food: ["Nasi Padang", "Warteg", "Ayam Geprek", "Bakso", "Mie Ayam", "Soto", "Nasi Goreng", "Mie Goreng", "Pecel Lele", "Kopi", "Es Teh", "Air Mineral"],
      goods: ["Fotokopi", "Print", "Jilid", "ATK", "Pulpen", "Staples", "Baterai", "Lampu", "Tisu", "Sabun", "Mi instan", "Minyak goreng", "Gula"]
    };
    const chipsWrap = document.getElementById('chipsWrap');
    const catRadios = document.querySelectorAll('input[name="cat"]');
  
    function renderChips(cat="food"){
      chipsWrap.innerHTML = "";
      CHIPS[cat].forEach(text=>{
        const c = document.createElement('button');
        c.type = 'button';
        c.className = 'chip';
        c.textContent = text;
        c.addEventListener('click', ()=>{
          const idx = itemsContainer.querySelectorAll('.item-row').length;
          const what = document.getElementById(`itemWhat${idx}`) || document.getElementById('itemWhat1');
          if (what) {
            what.value = text;
            what.focus();
          }
        });
        chipsWrap.appendChild(c);
      });
    }
    catRadios.forEach(r => r.addEventListener('change', e => renderChips(e.target.value)));
    renderChips("food");
  
    // ADD ITEM
    let itemCount = 1;
    addItemBtn.addEventListener('click', () => {
      itemCount++;
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-header"><span class="item-number">Item #${itemCount}</span></div>
        <div class="item-content">
          <div class="grid-2">
            <div class="input-group">
              <label for="itemWhat${itemCount}">Apa yang dipesan <span class="required">*</span></label>
              <input type="text" id="itemWhat${itemCount}" placeholder="Contoh: Fotokopi 20 lembar A4 BW" required />
            </div>
            <div class="input-group">
              <label for="itemQty${itemCount}">Jumlah <span class="required">*</span></label>
              <input type="number" id="itemQty${itemCount}" value="1" min="1" required />
            </div>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label for="itemNote${itemCount}">Keterangan</label>
              <input type="text" id="itemNote${itemCount}" placeholder="Contoh: Jilid lem panas, margin 3-3-3-3" />
            </div>
            <div class="input-group">
              <label for="itemSub${itemCount}">Boleh diganti setara?</label>
              <select id="itemSub${itemCount}">
                <option value="YA">YA</option>
                <option value="TIDAK">TIDAK</option>
              </select>
            </div>
          </div>
        </div>
      `;
      itemsContainer.appendChild(row);
      row.scrollIntoView({behavior:'smooth', block:'center'});
    });
  
    // VALIDATIONS
    function isValidMapsLink(url) {
      try {
        const u = new URL(url);
        const host = u.hostname.toLowerCase();
        return (host.includes('google.com') && u.pathname.startsWith('/maps'))
            || host.includes('maps.app.goo.gl');
      } catch {
        return false;
      }
    }
  
    function normalizeWaNumber(num) {
      const digits = (num || '').replace(/\D/g,'');
      if (digits.startsWith('0')) return '62' + digits.slice(1);
      return digits;
    }
  
    function validateForm() {
      if (!isValidMapsLink(mapsLink.value.trim())) {
        alert('Mohon tempelkan link Google Maps yang valid (google.com/maps atau maps.app.goo.gl).');
        return false;
      }
      const custType = document.querySelector('input[name="customerType"]:checked');
      if (!custType) { alert('Pilih tipe pelanggan.'); return false; }
  
      if (custType.value === 'penghuni' && !roomNo.value.trim()) {
        alert('Mohon isi nomor kamar.');
        return false;
      }
      if (custType.value === 'nonPenghuni' && !fullAddress.value.trim()) {
        alert('Mohon isi alamat lengkap pengantaran.');
        return false;
      }
      if (!custName.value.trim()) { alert('Mohon isi nama lengkap.'); return false; }
      if (!custWa.value.trim()) { alert('Mohon isi nomor WhatsApp.'); return false; }
  
      const firstWhat = document.getElementById('itemWhat1');
      const firstQty  = document.getElementById('itemQty1');
      if (!firstWhat.value.trim() || !firstQty.value) {
        alert('Mohon lengkapi item pertama.');
        return false;
      }
  
      return true;
    }
  
    // MESSAGE BUILDER
    function buildMessage() {
      const custType = document.querySelector('input[name="customerType"]:checked').value;
      const name = custName.value.trim();
      const phoneRaw = custWa.value.trim();
  
      const lokasiBeli = mapsLink.value.trim();
      const antarText = custType === 'penghuni'
        ? `Nomor Kamar: ${roomNo.value.trim()}`
        : `Alamat: ${fullAddress.value.trim()}`;
  
      const rows = itemsContainer.querySelectorAll('.item-row');
      let itemsText = '';
      rows.forEach((row, idx) => {
        const n = idx + 1;
        const w = row.querySelector(`#itemWhat${n}`).value.trim();
        const q = row.querySelector(`#itemQty${n}`).value.trim();
        const note = row.querySelector(`#itemNote${n}`)?.value.trim() || '-';
        const sub = row.querySelector(`#itemSub${n}`)?.value || 'YA';
  
        itemsText += `
  -------------------- PESANAN ${n} --------------------
  *Nama Item:* ${w}
  *Kuantitas:* ${q}
  *Keterangan:* ${note}
  *Ganti Setara:* ${sub}
  `;
      });
  
      const fee = CONFIG.deliveryFee.toLocaleString('id-ID');
  
      const message = `
  *--- PESANAN JASA TITIP KOS JOYFUL ---*
  
  *INFO PELANGGAN*
  *Nama:* ${name}
  *No. HP:* ${phoneRaw}
  *Tipe Pelanggan:* ${custType === 'penghuni' ? 'Penghuni Kos' : 'Non-Penghuni'}
  ${antarText}
  ==============================
  
  *LOKASI PEMBELIAN (Google Maps)*
  ${lokasiBeli}
  ==============================
  
  *DETAIL PESANAN* (Jasa Antar: Rp ${fee})
  ${itemsText}
  ==============================
  Jika fotokopi/print, mohon kirim file via WhatsApp setelah pesan ini.
  Mohon konfirmasi total harga dan ketersediaan barang.
  `.trim();
  
      return message;
    }
  
    function sendToWhatsApp() {
      const message = buildMessage();
      const encoded = encodeURIComponent(message);
      const url = `https://wa.me/${CONFIG.waNumber}?text=${encoded}`;
      notification.classList.remove('hidden');
      setTimeout(() => { window.location.href = url; }, 1200);
    }
  
    // SUBMIT
    submitBtn.addEventListener('click', () => {
      if (!CONFIG.isOpen) return;
      if (!validateForm()) return;
      sendToWhatsApp();
    });
  });
  