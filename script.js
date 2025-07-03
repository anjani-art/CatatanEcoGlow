// script.js

// --- 1. Konfigurasi dan Inisialisasi Firebase ---
// Pastikan ini adalah konfigurasi unik proyek Firebase Anda.
const firebaseConfig = {
    apiKey: "AIzaSyCwsvVqHEJpBCZWkqQYIJjSqp_2u0rks6U", // Ganti dengan API Key Anda yang sebenarnya
    authDomain: "catataneco.firebaseapp.com",
    projectId: "catataneco",
    storageBucket: "catataneco.firebasestorage.app",
    messagingSenderId: "672805524230",
    appId: "1:672805524230:web:b50431c1e833efdabac487"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// --- 2. Variabel Global Aplikasi & Elemen UI Utama ---
let currentUser = null; // Penting untuk melacak user yang sedang login
let confirmationResult; // Digunakan untuk alur autentikasi telepon (OTP)

// Elemen UI Autentikasi (pastikan ID ini ada di index.html Anda)
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const signupEmailButton = document.getElementById('signup-email-button');
const loginEmailButton = document.getElementById('login-email-button');

const authPhoneInput = document.getElementById('auth-phone');
const sendOtpButton = document.getElementById('send-otp-button');
const recaptchaContainer = document.getElementById('recaptcha-container'); // Penting untuk Phone Auth
const otpInputGroup = document.getElementById('otp-input-group'); // Grup input OTP
const authOtpInput = document.getElementById('auth-otp');
const verifyOtpButton = document.getElementById('verify-otp-button');
const authStatusMessage = document.getElementById('auth-status-message'); // Untuk pesan status login/error

// Elemen UI Halaman Notes
const noteText = document.getElementById('note-text'); // Menggunakan noteText sesuai kode Anda
const addNoteButton = document.getElementById('add-note-button');
const pinnedNotesContainer = document.getElementById('pinned-notes-container'); // Menggunakan container sesuai kode Anda
const otherNotesContainer = document.getElementById('other-notes-container'); // Menggunakan container sesuai kode Anda
const emptyPinnedNotesMessage = document.getElementById('empty-pinned-notes-message');
const emptyOtherNotesMessage = document.getElementById('empty-other-notes-message');
let notes = []; // Deklarasi awal, akan diisi oleh loadUserData

// Elemen UI Halaman Keuangan
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const currentBalanceEl = document.getElementById('current-balance');
const transactionDescriptionInput = document.getElementById('transaction-description');
const transactionAmountInput = document.getElementById('transaction-amount');
const transactionTypeSelect = document.getElementById('transaction-type');
const addTransactionButton = document.getElementById('add-transaction-button');
const transactionList = document.getElementById('transaction-list');
let transactions = []; // Deklarasi awal, akan diisi oleh loadUserData

// Elemen UI Halaman Produk
const productCategoriesGrid = document.getElementById('product-categories-grid');
const productListContainer = document.getElementById('product-list-container');
const productListCategoryTitle = document.getElementById('product-list-category-title');
const productDetailContent = document.getElementById('product-detail-content');
const homeCategoryCards = document.querySelectorAll('#home-page .category-card');


// --- 3. Fungsi Utility Aplikasi ---
function showAuthMessage(message, isError = false) {
    if (authStatusMessage) {
        authStatusMessage.textContent = message;
        authStatusMessage.style.color = isError ? 'var(--error-color)' : 'var(--primary-color)';
    }
}

// --- FUNGSI showPage Anda yang sudah ada ---
let currentPage = 'home'; // Pertahankan ini jika Anda menggunakannya
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    // Perhatikan bahwa ID halaman Anda sekarang adalah "home-page", "notes-page", dll.
    // dan untuk auth adalah "auth-page"
    const targetPageElement = document.getElementById(pageId + '-page'); // Sesuaikan dengan format ID HTML Anda
    if (targetPageElement) {
        targetPageElement.classList.add('active');
        currentPage = pageId;
        // sideMenu perlu didefinisikan dulu
        const sideMenu = document.getElementById('side-menu');
        if (sideMenu) {
            sideMenu.classList.remove('active'); // Close menu on page change
        }
    } else {
        console.error(`Page with ID ${pageId}-page not found.`);
    }
}

// --- 4. Listener Status Autentikasi Firebase (`onAuthStateChanged`) ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        console.log('User signed in:', user.email || user.phoneNumber, 'UID:', user.uid);
        showAuthMessage(`Selamat datang, ${user.email || user.phoneNumber || 'Pengguna'}!`, false);
        showPage('home'); // Arahkan ke halaman utama setelah login
        loadUserData(currentUser.uid); // Muat data user
    } else {
        currentUser = null;
        console.log('User signed out.');
        showPage('auth'); // Arahkan ke halaman autentikasi jika belum login
        showAuthMessage('Silakan masuk atau daftar.', false);
        clearUserData(); // Bersihkan data lokal saat logout
    }
});

// --- 5. Inisialisasi reCAPTCHA Verifier (PENTING untuk Autentikasi Telepon) ---
// Ini harus dipanggil saat DOM sudah siap, bisa di dalam DOMContentLoaded
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainer, {
    'size': 'invisible',
    'callback': (response) => {
        // reCAPTCHA berhasil diselesaikan
    },
    'expired-callback': () => {
        showAuthMessage('Verifikasi reCAPTCHA kedaluwarsa. Coba lagi.', true);
        window.recaptchaVerifier.render().then(function(widgetId) {
            grecaptcha.reset(widgetId);
        });
    }
});

// --- 6. Event Listener untuk Tombol-tombol Autentikasi ---

// Daftar dengan Email/Password
if (signupEmailButton) {
    signupEmailButton.addEventListener('click', () => {
        const email = authEmailInput.value;
        const password = authPasswordInput.value;

        if (!email || !password) {
            showAuthMessage('Email dan password tidak boleh kosong.', true);
            return;
        }
        if (password.length < 6) {
            showAuthMessage('Password minimal 6 karakter.', true);
            return;
        }

        showAuthMessage('Mendaftarkan akun...', false);
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User signed up:', userCredential.user);
            })
            .catch((error) => {
                showAuthMessage(`Error Daftar: ${error.message}`, true);
                console.error('Signup Error:', error);
            });
    });
}

// Masuk dengan Email/Password
if (loginEmailButton) {
    loginEmailButton.addEventListener('click', () => {
        const email = authEmailInput.value;
        const password = authPasswordInput.value;

        if (!email || !password) {
            showAuthMessage('Email dan password tidak boleh kosong.', true);
            return;
        }

        showAuthMessage('Masuk ke akun...', false);
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User logged in:', userCredential.user);
            })
            .catch((error) => {
                showAuthMessage(`Error Masuk: ${error.message}`, true);
                console.error('Login Error:', error);
            });
    });
}

// Autentikasi Telepon - Kirim OTP
if (sendOtpButton) {
    sendOtpButton.addEventListener('click', () => {
        const phoneNumber = authPhoneInput.value; // Pastikan formatnya sudah internasional, cth: +628123456789
        if (!phoneNumber) {
            showAuthMessage('Harap masukkan nomor telepon.', true);
            return;
        }

        showAuthMessage('Mengirim kode OTP...', false);
        auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                showAuthMessage('Kode OTP telah dikirim. Masukkan kode di bawah.', false);
                if (otpInputGroup) otpInputGroup.style.display = 'block';
                if (verifyOtpButton) verifyOtpButton.style.display = 'block';
                if (sendOtpButton) sendOtpButton.style.display = 'none';
            })
            .catch((error) => {
                showAuthMessage(`Error Kirim OTP: ${error.message}`, true);
                console.error('Send OTP Error:', error);
                window.recaptchaVerifier.render().then(function(widgetId) {
                    grecaptcha.reset(widgetId); // Reset reCAPTCHA jika ada error
                });
            });
    });
}

// Autentikasi Telepon - Verifikasi OTP
if (verifyOtpButton) {
    verifyOtpButton.addEventListener('click', () => {
        const code = authOtpInput.value;
        if (!code) {
            showAuthMessage('Harap masukkan kode OTP.', true);
            return;
        }

        showAuthMessage('Memverifikasi kode OTP...', false);
        confirmationResult.confirm(code)
            .then((result) => {
                console.log('Phone OTP verified:', result.user);
                // Reset UI OTP
                if (otpInputGroup) otpInputGroup.style.display = 'none';
                if (verifyOtpButton) verifyOtpButton.style.display = 'none';
                if (sendOtpButton) sendOtpButton.style.display = 'block';
                if (authPhoneInput) authPhoneInput.value = '';
                if (authOtpInput) authOtpInput.value = '';
            })
            .catch((error) => {
                showAuthMessage(`Error Verifikasi OTP: ${error.message}`, true);
                console.error('OTP Verify Error:', error);
            });
    });
}

// --- 7. Fungsi Logout ---
function logoutUser() {
    auth.signOut().then(() => {
        console.log('User signed out successfully.');
        showAuthMessage('Anda telah keluar.', false);
    }).catch((error) => {
        showAuthMessage(`Error Logout: ${error.message}`, true);
        console.error('Logout Error:', error);
    });
}

// --- 8. Fungsi untuk Memuat/Membersihkan Data Berdasarkan User (sementara masih localStorage) ---
function loadUserData(uid) {
    console.log(`Memuat data untuk user: ${uid}`);
    // Muat notes dan transactions dari localStorage dengan kunci per UID
    // TODO: GANTI INI NANTI DENGAN QUERY KE CLOUD FIRESTORE:
    // db.collection("users").doc(uid).collection("notes").get().then(...)
    notes = JSON.parse(localStorage.getItem(`notes_${uid}`) || '[]');
    transactions = JSON.parse(localStorage.getItem(`transactions_${uid}`) || '[]');

    renderNotes();
    calculateSummary();
    renderTransactions();
}

function clearUserData() {
    console.log('Membersihkan data karena user logout.');
    // Mengosongkan data di memori aplikasi
    notes = [];
    transactions = [];
    renderNotes();
    calculateSummary(); // Reset saldo ke 0
    renderTransactions();

    // Opsional: Hapus juga dari localStorage jika tidak ingin ada data lokal setelah logout
    localStorage.removeItem(`notes_${currentUser?.uid}`);
    localStorage.removeItem(`transactions_${currentUser?.uid}`);
    // Jika Anda punya data global tanpa UID, bisa dihapus juga:
    // localStorage.removeItem('notes');
    // localStorage.removeItem('transactions');
}

// --- 9. Logika Aplikasi Utama (Catatan, Keuangan, Produk) ---

// --- Catatan & Pengingat Functionality ---
// let notes = loadNotes(); // Panggilan ini akan dihapus/diganti oleh loadUserData

function saveNotes() {
    if (currentUser) {
        localStorage.setItem(`notes_${currentUser.uid}`, JSON.stringify(notes));
    } else {
        // Ini fallback, tapi idealnya tidak terjadi jika aplikasi sudah pakai autentikasi
        localStorage.setItem('notes', JSON.stringify(notes)); // Fallback untuk tanpa user ID
    }
}

// Fungsi loadNotes() asli Anda tidak perlu dihapus, tapi panggilannya akan digantikan oleh loadUserData.
// Saya ubah namanya agar tidak konflik jika Anda punya di tempat lain
function loadNotesFromLocalStorage() {
    const storedNotes = localStorage.getItem(`notes_${currentUser?.uid}`);
    return storedNotes ? JSON.parse(storedNotes).filter(note => note && note.id && note.text !== undefined) : [];
}

const createNoteElement = (note) => {
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note-item');
    if (note.pinned) {
        noteDiv.classList.add('pinned');
    }

    noteDiv.innerHTML = `
        <p class="note-content">${note.text}</p>
        <div class="note-actions">
            <button class="pin-button" data-id="${note.id}" title="${note.pinned ? 'Lepas Sematan' : 'Sematkan Catatan'}">
                <i class="fas fa-thumbtack ${note.pinned ? 'pinned' : ''}"></i>
            </button>
            <button class="delete-button" data-id="${note.id}" title="Hapus Catatan">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    noteDiv.querySelector('.delete-button').addEventListener('click', (e) => {
        const idToDelete = e.currentTarget.dataset.id;
        notes = notes.filter(note => note.id !== idToDelete);
        saveNotes();
        renderNotes();
    });

    noteDiv.querySelector('.pin-button').addEventListener('click', (e) => {
        const idToPin = e.currentTarget.dataset.id;
        const targetNote = notes.find(note => note.id === idToPin);
        if (targetNote) {
            targetNote.pinned = !targetNote.pinned;
            saveNotes();
            renderNotes();
        }
    });

    return noteDiv;
};

function renderNotes() {
    if (!pinnedNotesContainer || !otherNotesContainer) return;

    pinnedNotesContainer.innerHTML = '';
    otherNotesContainer.innerHTML = '';

    const pinnedNotes = notes.filter(note => note.pinned);
    const otherNotes = notes.filter(note => !note.pinned);

    if (pinnedNotes.length === 0) {
        if (emptyPinnedNotesMessage) emptyPinnedNotesMessage.style.display = 'block';
    } else {
        if (emptyPinnedNotesMessage) emptyPinnedNotesMessage.style.display = 'none';
        pinnedNotes.forEach(note => {
            pinnedNotesContainer.appendChild(createNoteElement(note));
        });
    }

    if (otherNotes.length === 0) {
        if (emptyOtherNotesMessage) emptyOtherNotesMessage.style.display = 'block';
    } else {
        if (emptyOtherNotesMessage) emptyOtherNotesMessage.style.display = 'none';
        otherNotes.forEach(note => {
            otherNotesContainer.appendChild(createNoteElement(note));
        });
    }
}

if (addNoteButton) { // Tambahkan cek ini
    addNoteButton.addEventListener('click', () => {
        const text = noteText.value.trim();
        if (text && currentUser) { // Pastikan ada user yang login sebelum menambahkan catatan
            const newNote = {
                id: Date.now().toString(),
                text: text,
                pinned: false
            };
            notes.unshift(newNote);
            saveNotes();
            renderNotes();
            noteText.value = '';
        } else if (!currentUser) {
            showAuthMessage('Anda harus masuk untuk menambahkan catatan.', true);
        }
    });
}
// renderNotes(); // Panggilan ini akan dipindahkan/diganti oleh loadUserData


// --- Keuangan Berkelanjutan Functionality ---
// let transactions = loadTransactions(); // Panggilan ini akan dihapus/diganti oleh loadUserData

function saveTransactions() {
    if (currentUser) {
        localStorage.setItem(`transactions_${currentUser.uid}`, JSON.stringify(transactions));
    } else {
        localStorage.setItem('transactions', JSON.stringify(transactions)); // Fallback untuk tanpa user ID
    }
}

// Fungsi loadTransactions() asli Anda tidak perlu dihapus, tapi panggilannya akan digantikan oleh loadUserData.
function loadTransactionsFromLocalStorage() {
    const storedTransactions = localStorage.getItem(`transactions_${currentUser?.uid}`);
    return storedTransactions ? JSON.parse(storedTransactions) : [];
}

function calculateSummary() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else {
            totalExpense += t.amount;
        }
    });

    const currentBalance = totalIncome - totalExpense;

    if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(totalIncome);
    if (totalExpenseEl) totalExpenseEl.textContent = formatCurrency(totalExpense);
    if (currentBalanceEl) {
        currentBalanceEl.textContent = formatCurrency(currentBalance);
        if (currentBalance < 0) {
            currentBalanceEl.style.color = '#F44336'; // Red
        } else {
            currentBalanceEl.style.color = '#21D4FD'; // Blue
        }
    }
}

function formatCurrency(amount) {
    return `Rp ${amount.toLocaleString('id-ID')}`;
}

function renderTransactions() {
    if (!transactionList) return;

    transactionList.innerHTML = '';

    if (transactions.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = 'Belum ada transaksi.';
        transactionList.appendChild(emptyMessage);
    } else {
        transactions.forEach(t => {
            const li = document.createElement('li');
            li.classList.add('transaction-item', t.type);
            li.innerHTML = `
                <div class="transaction-details">
                    <h4>${t.description}</h4>
                    <p>${new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span class="transaction-amount-display">${t.type === 'expense' ? '-' : ''}${formatCurrency(t.amount)}</span>
                <button class="delete-button" data-id="${t.id}" title="Hapus Transaksi">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            transactionList.appendChild(li);

            li.querySelector('.delete-button').addEventListener('click', (e) => {
                const idToDelete = e.currentTarget.dataset.id;
                transactions = transactions.filter(transaction => transaction.id !== idToDelete);
                saveTransactions();
                calculateSummary();
                renderTransactions();
            });
        });
    }
}

if (addTransactionButton) { // Tambahkan cek ini
    addTransactionButton.addEventListener('click', () => {
        const description = transactionDescriptionInput.value.trim();
        const amount = parseFloat(transactionAmountInput.value);
        const type = transactionTypeSelect.value;

        if (description && !isNaN(amount) && amount > 0 && currentUser) { // Pastikan ada user login
            const newTransaction = {
                id: Date.now().toString(),
                description: description,
                amount: amount,
                type: type,
                date: new Date().toISOString()
            };
            transactions.push(newTransaction);
            saveTransactions();
            calculateSummary();
            renderTransactions();

            transactionDescriptionInput.value = '';
            transactionAmountInput.value = '';
            transactionTypeSelect.value = 'income';
        } else if (!currentUser) {
            showAuthMessage('Anda harus masuk untuk menambahkan transaksi.', true);
        } else {
            alert('Harap isi deskripsi dan jumlah yang valid.');
        }
    });
}

// calculateSummary(); // Panggilan ini akan dipindahkan/diganti oleh loadUserData
// renderTransactions(); // Panggilan ini akan dipindahkan/diganti oleh loadUserData


// --- Saran Produk Go Green Functionality ---
const greenProductsData = [
    {
        id: 'dpr001',
        category: 'Dapur',
        name: 'Pencuci Piring Refill',
        description: 'Sabun cuci piring konsentrat yang bisa diisi ulang, mengurangi limbah plastik.',
        sertifikasi: ['Eco-label', 'Bebas Paraben'],
        bahan_baku: ['Minyak kelapa', 'Ekstrak jeruk'],
        proses_produksi: 'Produksi minim limbah, tanpa uji hewan.',
        dampak_lingkungan: 'Mengurangi limbah plastik sekali pakai, biodegradable.',
        diy_tips: 'Gunakan sisa air bilasan untuk menyiram tanaman non-konsumsi.',
        link_pembelian: 'https://shopee.co.id/sabun-cuci-piring-refill-i.12345678.9012345678'
    },
    {
        id: 'dpr002',
        category: 'Dapur',
        name: 'Spons Cuci Piring Loofah',
        description: 'Spons alami dari serat loofah, dapat terurai secara hayati.',
        sertifikasi: ['Vegan', 'Komposibel'],
        bahan_baku: ['Serat Loofah alami'],
        proses_produksi: 'Budidaya loofah berkelanjutan, tanpa bahan kimia.',
        dampak_lingkungan: 'Alternatif ramah lingkungan untuk spons plastik, mengurangi mikroplastik.',
        diy_tips: 'Bilas bersih setelah digunakan dan keringkan untuk memperpanjang usia.',
        link_pembelian: 'https://shopee.co.id/spons-loofah-alami-i.98765432.1098765432'
    },
    {
        id: 'prd001',
        category: 'Perawatan Diri',
        name: 'Sabun Batang Organik',
        description: 'Sabun mandi alami tanpa kemasan plastik, dibuat dari bahan organik.',
        sertifikasi: ['BPOM', 'Organik Bersertifikat'],
        bahan_baku: ['Minyak zaitun', 'Minyak kelapa', 'Shea butter'],
        proses_produksi: 'Cold process, minim energi, buatan tangan.',
        dampak_lingkungan: 'Bebas mikroplastik, kemasan minimalis, biodegradable.',
        diy_tips: 'Gunakan jaring sabun untuk busa lebih banyak dan hemat sabun.',
        link_pembelian: 'https://shopee.co.id/sabun-organik-batang-i.11223344.5566778899'
    },
    {
        id: 'prd002',
        category: 'Perawatan Diri',
        name: 'Sikat Gigi Bambu',
        description: 'Sikat gigi dengan gagang bambu yang dapat terurai, bulu sikat dari nylon bebas BPA.',
        sertifikasi: ['Bebas BPA', 'Vegan'],
        bahan_baku: ['Bambu Moso', 'Nylon-6'],
        proses_produksi: 'Gagang bambu dari sumber berkelanjutan.',
        dampak_lingkungan: 'Mengurangi limbah plastik dari sikat gigi konvensional.',
        diy_tips: 'Setelah bulu sikat habis, lepas bulu sikat dan gunakan gagang bambu untuk label tanaman atau kerajinan.',
        link_pembelian: 'https://shopee.co.id/sikat-gigi-bambu-i.22334455.6677889900'
    },
    {
        id: 'pkn001',
        category: 'Pakaian',
        name: 'Tas Belanja Lipat Reusable',
        description: 'Tas belanja kain yang ringan dan dapat dilipat, pengganti kantong plastik.',
        sertifikasi: ['OEKO-TEX'],
        bahan_baku: ['Katun organik', 'Poliester daur ulang (RPET)'],
        proses_produksi: 'Jahitan tangan, pewarna alami.',
        dampak_lingkungan: 'Mengurangi penggunaan kantong plastik sekali pakai secara signifikan.',
        diy_tips: 'Selalu bawa di tas Anda agar tidak lupa saat berbelanja.',
        link_pembelian: 'https://shopee.co.id/tas-belanja-reusable-i.33445566.7788990011'
    },
    {
        id: 'kms001',
        category: 'Kemasan',
        name: 'Beeswax Wrap (Pembungkus Makanan)',
        description: 'Alternatif pembungkus plastik yang dapat digunakan kembali, terbuat dari kain katun berlapis beeswax.',
        sertifikasi: ['Food Grade', 'Zero Waste'],
        bahan_baku: ['Kain katun', 'Beeswax', 'Minyak jojoba', 'Resin pohon'],
        proses_produksi: 'Handmade, tanpa bahan kimia berbahaya.',
        dampak_lingkungan: 'Mengurangi limbah plastik, dapat terurai secara hayati.',
        diy_tips: 'Cuci dengan air dingin dan sabun ringan, keringkan, dan gunakan kembali.',
        link_pembelian: 'https://shopee.co.id/beeswax-wrap-i.44556677.8899001122'
    },
    {
        id: 'kebun001',
        category: 'Pertanian & Kebun',
        name: 'Pupuk Kompos Organik',
        description: 'Pupuk alami dari sisa-sisa organik, menyuburkan tanah tanpa bahan kimia.',
        sertifikasi: ['Organik Bersertifikat'],
        bahan_baku: ['Sisa makanan', 'Daun kering', 'Rumput'],
        proses_produksi: 'Proses dekomposisi alami (kompos rumah tangga).',
        dampak_lingkungan: 'Mengurangi limbah organik ke TPA, meningkatkan kesuburan tanah alami.',
        diy_tips: 'Buat sendiri di rumah dengan wadah kompos sederhana.',
        link_pembelian: 'https://shopee.co.id/pupuk-kompos-organik-i.55667788.9900112233'
    }
];

const productCategories = [
    { name: 'Dapur', icon: 'fas fa-utensils' },
    { name: 'Perawatan Diri', icon: 'fas fa-spa' },
    { name: 'Pakaian', icon: 'fas fa-tshirt' },
    { name: 'Kemasan', icon: 'fas fa-box' },
    { name: 'Pertanian & Kebun', icon: 'fas fa-seedling' }
];

function renderProductCategories() {
    if (!productCategoriesGrid) return;
    productCategoriesGrid.innerHTML = '';
    productCategories.forEach(category => {
        const card = document.createElement('div');
        card.classList.add('category-card');
        card.dataset.category = category.name;
        card.innerHTML = `
            <i class="${category.icon}"></i>
            <h3>${category.name}</h3>
        `;
        productCategoriesGrid.appendChild(card);

        card.addEventListener('click', () => {
            renderProductsByCategory(category.name);
            showPage('product-list');
        });
    });
}

function renderProductsByCategory(categoryName) {
    if (!productListContainer || !productListCategoryTitle) return;

    productListContainer.innerHTML = '';
    productListCategoryTitle.textContent = `Produk Kategori: ${categoryName}`;

    const filteredProducts = greenProductsData.filter(p => p.category === categoryName);

    if (filteredProducts.length === 0) {
        productListContainer.innerHTML = '<p style="text-align: center; color: #C0C0C0;">Belum ada produk di kategori ini.</p>';
    } else {
        filteredProducts.forEach(product => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            productItem.dataset.id = product.id;
            productItem.innerHTML = `
                <h3>${product.name}</h3>
                <p>${product.description.substring(0, 80)}...</p>
            `;
            productListContainer.appendChild(productItem);

            productItem.addEventListener('click', () => {
                showProductDetail(product.id);
                showPage('product-detail');
            });
        });
    }
}

function showProductDetail(productId) {
    if (!productDetailContent) return;

    const product = greenProductsData.find(p => p.id === productId);
    if (!product) {
        productDetailContent.innerHTML = '<p style="text-align: center; color: #F44336;">Produk tidak ditemukan.</p>';
        return;
    }

    productDetailContent.innerHTML = `
        <h2>${product.name}</h2>
        <p>${product.description}</p>

        <h3>Sertifikasi</h3>
        <ul>
            ${product.sertifikasi.map(s => `<li>${s}</li>`).join('')}
        </ul>

        <h3>Bahan Baku Utama</h3>
        <ul>
            ${product.bahan_baku.map(b => `<li>${b}</li>`).join('')}
        </ul>

        <h3>Proses Produksi</h3>
        <p>${product.proses_produksi}</p>

        <h3>Dampak Lingkungan</h3>
        <p>${product.dampak_lingkungan}</p>

        <h3>Tips DIY & Penggunaan Berkelanjutan</h3>
        <p>${product.diy_tips}</p>

        <h3>Link Pembelian</h3>
        <p><a href="${product.link_pembelian}" target="_blank" class="product-detail-link">Beli di Shopee</a></p>
    `;
}

if (homeCategoryCards) { // Tambahkan cek ini
    homeCategoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            renderProductsByCategory(category);
            showPage('product-list');
        });
    });
}

// --- 10. Inisialisasi Aplikasi Saat DOM Siap ---
document.addEventListener('DOMContentLoaded', () => {
    // --- PWA Service Worker Registration --- (Sudah ada, pertahankan)
    // Bagian ini biasanya di file service-worker-registration.js, tapi jika ada di sini tidak masalah
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }

    // --- Inisialisasi reCAPTCHA Verifier (PENTING untuk Autentikasi Telepon) ---
    // Dipindahkan ke sini dari bagian atas agar `recaptchaContainer` pasti sudah ada di DOM
    recaptchaVerifier.render();

    // --- DOM Elements --- (Tetap seperti aslinya)
    const appContent = document.getElementById('app-content');
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.getElementById('side-menu');
    const navLinks = document.querySelectorAll('.side-menu a');
    const backButtons = document.querySelectorAll('.back-button');

    // --- Event Listeners for Navigation --- (Tetap seperti aslinya)
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (sideMenu) sideMenu.classList.toggle('active');
        });
    }

    const closeMenuButton = document.getElementById('close-menu');
    if (closeMenuButton) {
        closeMenuButton.addEventListener('click', () => {
            if (sideMenu) sideMenu.classList.remove('active');
        });
    }

    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                showPage(page);
            });
        });
    }

    if (backButtons) {
        backButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetPage = e.currentTarget.dataset.target;
                showPage(targetPage);
                if (targetPage === 'product-list') {
                    const categoryTitleElement = document.getElementById('product-list-category-title');
                    if (categoryTitleElement) {
                        const categoryTitle = categoryTitleElement.textContent;
                        const category = categoryTitle.replace('Produk Kategori: ', '');
                        renderProductsByCategory(category);
                    } else {
                        renderProductCategories();
                        showPage('products');
                    }
                }
            });
        });
    }

    // --- Event listener untuk tombol logout di menu samping (jika ada) ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }

    // Initialize product categories on page load for the 'produk' page
    renderProductCategories();

    // Catatan: Panggilan `renderNotes()`, `calculateSummary()`, `renderTransactions()`
    // tidak lagi perlu dilakukan di sini, karena `loadUserData()` yang dipanggil oleh
    // `onAuthStateChanged` akan menanganinya setelah user terautentikasi.
    // Jika Anda ingin ada tampilan default untuk catatan/transaksi saat belum login,
    // Anda bisa memanggilnya di `clearUserData()` atau di luar `onAuthStateChanged`
    // (tapi data tidak akan disimpan per user).

    // --- Initial Page Load ---
    // showPage('home'); // Panggilan ini akan digantikan oleh `onAuthStateChanged`
    // agar halaman login muncul pertama kali jika belum login
});
