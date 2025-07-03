// --- script.js ---

// Register Service Worker for PWA capabilities
// Ini adalah kode yang menghubungkan script.js ke service-worker.js
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

document.addEventListener('DOMContentLoaded', () => {
    // --- 0. Referensi Elemen DOM (Document Object Model) ---
    // Elemen Header dan Navigasi
    const backButton = document.getElementById('backButton');
    const headerTitle = document.getElementById('headerTitle');

    // Kontainer Halaman Utama
    const dashboardPage = document.getElementById('dashboardPage');
    const searchPage = document.getElementById('searchPage');
    const notesPage = document.getElementById('notesPage');
    const financePage = document.getElementById('financePage');
    const productCategoriesPage = document.getElementById('productCategoriesPage');
    const productListingsPage = document.getElementById('productListingsPage');
    const productDetailPage = document.getElementById('productDetailPage');

    let currentPageElement = dashboardPage; // Melacak elemen halaman yang sedang aktif

    // Kartu Fitur di Dashboard
    const searchCard = document.getElementById('searchCard');
    const notesCard = document.getElementById('notesCard');
    const financeCard = document.getElementById('financeCard');
    const greenProductsCard = document.getElementById('greenProductsCard');

    // Halaman Pencarian
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');
    const productSearchResultsList = document.getElementById('productSearchResultsList');
    const noteSearchResultsList = document.getElementById('noteSearchResultsList');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Halaman Catatan
    const noteInput = document.getElementById('noteInput');
    const addNoteButton = document.getElementById('addNoteButton');
    const pinnedNotesList = document.getElementById('pinnedNotesList');
    const otherNotesList = document.getElementById('otherNotesList');

    // Halaman Keuangan
    const transactionAmount = document.getElementById('transactionAmount');
    const transactionDescription = document.getElementById('transactionDescription');
    const transactionType = document.getElementById('transactionType');
    const addTransactionButton = document.getElementById('addTransactionButton');
    const totalIncomeDisplay = document.getElementById('totalIncome');
    const totalExpenseDisplay = document.getElementById('totalExpense');
    const netBalanceDisplay = document.getElementById('netBalance');
    const transactionHistoryBody = document.getElementById('transactionHistoryBody');

    // Halaman Saran Produk Go Green
    const categoryGrid = document.getElementById('categoryGrid');
    const productList = document.getElementById('productList');
    const productListingTitle = document.getElementById('productListingTitle');

    // Elemen Detail Produk
    const productNameDetail = document.getElementById('productNameDetail');
    const productCertifications = document.getElementById('productCertifications');
    const productIngredients = document.getElementById('productIngredients');
    const productProduction = document.getElementById('productProduction');
    const productImpact = document.getElementById('productImpact');
    const productDIY = document.getElementById('productDIY');


    // --- 1. Data Produk Go Green (Lengkap dengan detail dan link Shopee) ---
    const greenProductsData = [
        {
            id: 'sabun-lerak',
            category: 'Rumah Tangga',
            name: 'Sabun Cuci Piring Lerak Cair',
            shortDesc: 'Dibuat dari buah lerak asli, agen pembersih alami dan 100% biodegradable.',
            details: {
                certifications: ['Eco-Certified', 'Biodegradable'],
                ingredients: 'Ekstrak buah lerak, air murni, minyak esensial lemon.',
                production: 'Diproses secara manual dengan minim energi. Limbah produksi dapat terurai dengan cepat.',
                impact: 'Mengurangi polusi air dan ketergantungan pada bahan kimia sintetis. Mengurangi limbah plastik dengan isi ulang.',
                diy: 'Anda bisa membuat sendiri cairan lerak dari buah lerak kering. Rebus dan saring! <br><br>Jika tidak ingin membuat sendiri, berikut contoh produk di Shopee: <a href="https://shopee.co.id/Sabun-Lerak-Cair-1-Liter-Alami-Organicenter-Deterjen-Cuci-Piring-Pakaian-Bayi-Batik-Clodi-Menspad-Pel-1000-ml-Zero-Waste-i.10077729.10746910519?sp_atk=d2460058-3da4-492a-977c-fabd67bbfe4d&xptdk=d2460058-3da4-492a-977c-fabd67bbfe4d" target="_blank" rel="noopener noreferrer" style="color:var(--primary-blue); font-weight:600;">Sabun Lerak Cair (Link Eksternal)</a>'
            }
        },
        {
            id: 'pembersih-cuka',
            category: 'Rumah Tangga',
            name: 'Pembersih Serbaguna Cuka & Lemon',
            shortDesc: 'Formulasi alami berbasis cuka dan ekstrak lemon. Alternatif non-toksik.',
            details: {
                certifications: ['Natural-Ingredient'],
                ingredients: 'Cuka putih, air suling, minyak esensial lemon, baking soda.',
                production: 'Produksi rumahan/lokal dengan jejak karbon rendah.',
                impact: 'Menghindari paparan bahan kimia berbahaya, aman untuk keluarga dan hewan peliharaan, mengurangi polusi udara dalam ruangan.',
                diy: 'Campurkan cuka putih, air, dan beberapa tetes minyak esensial untuk pembersih kaca.'
            }
        },
        {
            id: 'sabun-batang-kelapa',
            category: 'Perawatan Diri',
            name: 'Sabun Batang Minyak Kelapa Organik',
            shortDesc: 'Dibuat dengan minyak kelapa organik bersertifikat, kemasan minimal.',
            details: {
                certifications: ['Organic Certified', 'Vegan'],
                ingredients: 'Minyak kelapa organik, air, sodium hydroxide (untuk saponifikasi), minyak esensial.',
                production: 'Metode saponifikasi dingin, tanpa panas berlebih, hemat energi.',
                impact: 'Mendukung pertanian kelapa organik, bebas mikroplastik dari sabun cair, kemasan kertas daur ulang.',
                diy: 'Resep sabun batangan DIY tersedia online, perhatikan keamanan penggunaan soda api. <br><br>Jika tidak ingin membuat sendiri, berikut contoh produk di Shopee: <a href="https://shopee.co.id/Sabun-Mandi-Herbal-VCO-Griya-Herbal-Untuk-menghaluskan-dan-hilangkan-flek-hitam-POM-NA-Halal-i.270303395.7970521397?sp_atk=d032d154-dd56-4164-a8bc-b37a6eee3efb&xptdk=d032d154-dd56-4164-a8bc-b37a6eee3efb" target="_blank" rel="noopener noreferrer" style="color:var(--primary-blue); font-weight:600;">Sabun Mandi Herbal VCO (Link Eksternal)</a>'
            }
        },
        {
            id: 'sikat-gigi-bambu',
            category: 'Perawatan Diri',
            name: 'Sikat Gigi Bambu',
            shortDesc: 'Pegangan dari bambu yang biodegradable, mengurangi penggunaan plastik.',
            details: {
                certifications: ['BPA-Free', 'Biodegradable Handle'],
                ingredients: 'Pegangan: Bambu Moso. Bulu sikat: Nylon-6 (dapat didaur ulang jika dipisahkan) atau serat arang bambu.',
                production: 'Produksi minimalis, bambu tumbuh cepat dan tidak memerlukan banyak air.',
                impact: 'Mengurangi limbah plastik global dari sikat gigi. Bambu adalah sumber daya terbarukan.',
                diy: 'Tidak dapat dibuat sendiri di rumah. <br><br>Berikut contoh produk sikat gigi bambu di Shopee: <a href="https://shopee.co.id/Pepsodent-Sikat-Gigi-Bambu-Natural-Soft-Isi-1-i.1517647103.28336356476?sp_atk=205d4165-3c67-4a62-9579-b1f20cc6fae8&xptdk=205d4165-3c67-4a62-9579-b1f20cc6fae8" target="_blank" rel="noopener noreferrer" style="color:var(--primary-blue); font-weight:600;">Pepsodent Sikat Gigi Bambu (Link Eksternal)</a>'
            }
        },
        {
            id: 'kaus-katun-organik',
            category: 'Pakaian',
            name: 'Kaus Katun Organik',
            shortDesc: 'Terbuat dari katun yang ditanam tanpa pestisida dan pupuk kimia.',
            details: {
                certifications: ['GOTS Certified Organic Cotton', 'Fair Labor'],
                ingredients: '100% Katun Organik.',
                production: 'Ditanam tanpa bahan kimia berbahaya, mengurangi penggunaan air dan emisi. Proses pewarnaan ramah lingkungan.',
                impact: 'Meningkatkan kualitas tanah, mengurangi paparan pestisida bagi petani, mengurangi konsumsi air.',
                diy: 'Tidak dapat dibuat sendiri di rumah. <br><br>Berikut contoh produk kaus katun organik di Shopee: <a href="https://shopee.co.id/TONIQUE-Kaos-Katun-Organik-Wanita-Biru-BELLONA-Womens-Cotton-T-Shirt-i.953741345.23738667351?sp_atk=a598bf79-28ed-4bcd-bfe3-c3945d44468d&xptdk=205d4165-3c67-4a62-9537-b1f20cc6fae8&xptdk=205d4165-3c67-4a62-9579-b1f20cc6fae8" target="_blank" rel="noopener noreferrer" style="color:var(--primary-blue); font-weight:600;">TONIQUE Kaos Katun Organik (Link Eksternal)</a>'
            }
        },
        {
            id: 'plastik-biodegradable',
            category: 'Kemasan',
            name: 'Kantong Plastik Biodegradable',
            shortDesc: 'Terurai alami dalam waktu singkat tanpa meninggalkan mikroplastik.',
            details: {
                certifications: ['Compostable Certified (ASTM D6400)'],
                ingredients: 'Pati singkong/jagung, polimer nabati.',
                production: 'Diproduksi dari biomassa terbarukan, jejak karbon lebih rendah.',
                impact: 'Terurai sepenuhnya di lingkungan dalam waktu singkat (mis. 90 hari di fasilitas kompos), tidak menyumbang mikroplastik. Mengurangi ketergantungan pada plastik berbasis fosil.',
                diy: 'Tidak dapat dibuat sendiri di rumah. <br><br>Berikut contoh produk kantong plastik biodegradable di Shopee: <a href="https://shopee.co.id/Kantong-Singkong-Kresek-Ramah-Lingkungan-Cassava-T-Shirt-Bag-i.323057013.24634077620?sp_atk=0d4417c2-5b2c-45c6-b654-ea8b9cd99b10&xptdk=0d4417c2-5b2c-45c6-b654-ea8b9cd99b10" target="_blank" rel="noopener noreferrer" style="color:var(--primary-blue); font-weight:600;">Kantong Singkong Kresek (Link Eksternal)</a>'
            }
        },
        {
            id: 'wadah-stainless',
            category: 'Kemasan',
            name: 'Wadah Makanan Stainless Steel',
            shortDesc: 'Alternatif bebas plastik, tahan lama, dan dapat digunakan berulang kali.',
            details: {
                certifications: ['Food-Grade Stainless Steel'],
                ingredients: 'Stainless Steel (Grade 304 atau 316).',
                production: 'Proses produksi energi intensif, namun produk sangat tahan lama dan dapat didaur ulang 100%.',
                impact: 'Pengganti ideal untuk plastik sekali pakai, sangat mengurangi limbah. Tahan lama (umur pakai puluhan tahun). Dapat didaur ulang tanpa kehilangan kualitas.',
                diy: 'Tidak dapat dibuat sendiri di rumah. <br><br>Berikut contoh produk wadah makanan stainless steel di Shopee: <a href="https://shopee.co.id/Panda-Home-Lunch-Box-Stainless-Sekat-3-FREE-Sendok-Dan-Sumpit-Kotak-Bekal-Makan-i.350552795.3677713347?sp_atk=5dfe6d80-06f7-4602-a9f6-394844b3daa2&xptdk=5dfe6d80-06f7-4602-a9f6-394844b3daa2" target="_blank" rel="noopener noreferrer" style="color:var(--primary-blue); font-weight:600;">Panda Home Lunch Box (Link Eksternal)</a>'
            }
        },
        {
            id: 'tumbler-stainless',
            category: 'Kemasan',
            name: 'Tumbler Stainless Steel',
            shortDesc: 'Tumbler tahan panas/dingin yang mengurangi penggunaan gelas sekali pakai.',
            details: {
                certifications: ['BPA-Free', 'Food-Grade Stainless Steel'],
                ingredients: 'Stainless Steel (mis. SUS304).',
                production: 'Produksi standar industri dengan fokus pada durabilitas untuk penggunaan jangka panjang.',
                impact: 'Mengurangi signifikan limbah gelas plastik/kertas sekali pakai. Tahan lama dan dapat didaur ulang.',
                diy: 'Tidak dapat dibuat sendiri di rumah. <br><br>Berikut contoh produk tumbler stainless steel di Shopee: <a href="https://shopee.co.id/Eatkit-Tumbler-Stainless-Steel-320ml-600ml-Tumbler-Kopi-Tumbler-Tahan-Panas-Dingin-24-Jam-i.1113470230.24322289831?sp_atk=c882ce4-f563-4b38-9cce-a3681a6722c1&xptdk=c882ce4-f563-4b38-9cce-a3681a6722c1" target="_blank" rel="noopener noreferrer" style="color:var(--primary-blue); font-weight:600;">Eatkit Tumbler Stainless Steel (Link Eksternal)</a>'
            }
        },
        {
            id: 'pupuk-eco-enzyme',
            category: 'Pertanian & Kebun',
            name: 'Pupuk Cair Eco Enzyme',
            shortDesc: 'Cairan organik serbaguna dari fermentasi sisa buah/sayuran, efektif sebagai pupuk.',
            details: {
                certifications: ['Organik', 'Biodegradable'],
                ingredients: 'Fermentasi kulit buah/sayuran, gula, air bersih.',
                production: 'Dibuat melalui proses fermentasi alami selama minimal 3 bulan.',
                impact: 'Mengurangi limbah organik rumah tangga, mengurangi penggunaan pupuk kimia, menyuburkan tanah, dan dapat membersihkan saluran air.',
                diy: 'Eco Enzyme dapat dibuat sendiri di rumah dengan mudah menggunakan sisa buah/sayuran, gula, dan air. Banyak panduan DIY tersedia online! <br><br>Jika tidak ingin membuat sendiri, berikut contoh produk Pupuk Cair Eco Enzyme di Shopee: <a href="https://shopee.co.id/ECO-ENZYME-1000ml-(1-liter)-Cairan-Organik-Beragam-Manfaat-i.1202248398.28674252673?sp_atk=136f5098-6b52-472b-aaaa-df90479ad4a0&xptdk=136f5098-6b52-472b-aaaa-df90479ad4a0" target="_blank" rel="noopener noreferrer" style="color:var(--primary-blue); font-weight:600;">ECO ENZYME 1 Liter (Link Eksternal)</a>'
            }
        }
    ];

    const productCategories = [
        { id: 'cat-dapur', name: 'Dapur', icon: 'fas fa-utensils' },
        { id: 'cat-belanja', name: 'Belanja', icon: 'fas fa-shopping-bag' },
        { id: 'cat-rumah', name: 'Rumah Tangga', icon: 'fas fa-home' },
        { id: 'cat-energi', name: 'Energi', icon: 'fas fa-lightbulb' },
        { id: 'cat-perawatan', name: 'Perawatan Diri', icon: 'fas fa-spa' },
        { id: 'cat-pakaian', name: 'Pakaian', icon: 'fas fa-tshirt' },
        { id: 'cat-kemasan', name: 'Kemasan', icon: 'fas fa-box-open' },
        { id: 'cat-pertanian', name: 'Pertanian & Kebun', icon: 'fas fa-seedling' },
    ];


    // --- 2. Fungsi Navigasi Halaman ---
    const showPage = (pageElement, title) => {
        // Sembunyikan semua halaman
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        // Tampilkan halaman yang diminta
        pageElement.classList.add('active');
        currentPageElement = pageElement; // Perbarui referensi halaman aktif

        // Perbarui judul header
        headerTitle.textContent = title;

        // Tampilkan atau sembunyikan tombol kembali
        if (pageElement.id === 'dashboardPage') {
            backButton.style.display = 'none';
        } else {
            backButton.style.display = 'flex';
        }
    };

    // Event listener untuk tombol kembali
    backButton.addEventListener('click', () => {
        // Kembali ke dashboardPage dari halaman manapun
        showPage(dashboardPage, 'EcoGlow');
        // Reset kondisi halaman tertentu saat kembali ke dashboard
        searchInput.value = ''; // Bersihkan input pencarian
        searchResultsContainer.style.display = 'none'; // Sembunyikan hasil pencarian
        productSearchResultsList.innerHTML = '';
        noteSearchResultsList.innerHTML = '';
        noResultsMessage.style.display = 'none';
        renderNotes(); // Pastikan catatan diperbarui
        renderTransactions(); // Pastikan transaksi diperbarui
    });

    // Event listeners untuk kartu fitur di Dashboard
    searchCard.addEventListener('click', () => showPage(searchPage, 'Pencarian Cerdas'));
    notesCard.addEventListener('click', () => showPage(notesPage, 'Catatan & Pengingat'));
    financeCard.addEventListener('click', () => showPage(financePage, 'Keuangan Berkelanjutan'));
    greenProductsCard.addEventListener('click', () => showPage(productCategoriesPage, 'Saran Produk Go Green'));

    // Inisialisasi: Tampilkan dashboardPage saat aplikasi pertama kali dimuat
    showPage(dashboardPage, 'EcoGlow');


    // --- 3. Fungsionalitas Pencarian ---
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();

        // Tampilkan/sembunyikan kontainer hasil pencarian
        if (query.length > 0) {
            searchResultsContainer.style.display = 'block';
        } else {
            searchResultsContainer.style.display = 'none';
            // Sembunyikan header kategori juga jika query kosong
            document.getElementById('productSearchResultsHeader').style.display = 'none';
            document.getElementById('noteSearchResultsHeader').style.display = 'none';
            return; // Hentikan jika query kosong
        }

        // Bersihkan hasil sebelumnya
        productSearchResultsList.innerHTML = '';
        noteSearchResultsList.innerHTML = '';
        noResultsMessage.style.display = 'none';

        let foundResultsCount = 0;

        // --- Cari di Data Produk Go Green ---
        const filteredProducts = greenProductsData.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.shortDesc.toLowerCase().includes(query) ||
            (product.details && Object.values(product.details).some(detail =>
                (typeof detail === 'string' && detail.toLowerCase().includes(query)) ||
                (Array.isArray(detail) && detail.some(item => item.toLowerCase().includes(query)))
            ))
        );

        if (filteredProducts.length > 0) {
            // Tampilkan header kategori jika ada hasil
            document.getElementById('productSearchResultsHeader').style.display = 'block';
            filteredProducts.forEach(product => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('search-result-item');
                itemDiv.innerHTML = `<p>${product.name} - ${product.shortDesc}</p><span class="item-type">Produk</span>`;
                itemDiv.addEventListener('click', () => {
                    showProductDetail(product.id); // Navigasi ke detail produk
                    searchInput.value = ''; // Bersihkan input pencarian
                    searchResultsContainer.style.display = 'none'; // Sembunyikan hasil pencarian
                });
                productSearchResultsList.appendChild(itemDiv);
                foundResultsCount++;
            });
        } else {
            document.getElementById('productSearchResultsHeader').style.display = 'none';
        }

        // --- Cari di Catatan ---
        const filteredNotes = notes.filter(note =>
            note.content.toLowerCase().includes(query)
        );

        if (filteredNotes.length > 0) {
            // Tampilkan header kategori jika ada hasil
            document.getElementById('noteSearchResultsHeader').style.display = 'block';
            filteredNotes.forEach(note => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('search-result-item');
                // Tampilkan sebagian kecil konten catatan
                const displayContent = note.content.substring(0, 70) + (note.content.length > 70 ? '...' : '');
                itemDiv.innerHTML = `<p>"${displayContent}"</p><span class="item-type">Catatan</span>`;
                itemDiv.addEventListener('click', () => {
                    showPage(notesPage, 'Catatan & Pengingat'); // Navigasi ke halaman catatan
                    searchInput.value = ''; // Bersihkan input pencarian
                    searchResultsContainer.style.display = 'none'; // Sembunyikan hasil pencarian
                    // Opsional: tambahkan logika untuk menggulir ke atau menyorot catatan yang ditemukan
                });
                noteSearchResultsList.appendChild(itemDiv);
                foundResultsCount++;
            });
        } else {
            document.getElementById('noteSearchResultsHeader').style.display = 'none';
        }

        // Tampilkan pesan 'Tidak ada hasil' jika tidak ditemukan apa pun
        if (foundResultsCount === 0 && query.length > 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }
    });


    // --- 4. Fungsionalitas Catatan ---
    let notes = JSON.parse(localStorage.getItem('notes')) || []; // Muat catatan dari localStorage

    const saveNotes = () => {
        localStorage.setItem('notes', JSON.stringify(notes)); // Simpan catatan ke localStorage
    };

    const renderNotes = () => {
        // Urutkan catatan: yang disematkan di atas, lalu berdasarkan tanggal terbaru
        notes.sort((a, b) => (b.pinned - a.pinned) || (new Date(b.createdAt) - new Date(a.createdAt)));

        pinnedNotesList.innerHTML = ''; // Bersihkan daftar catatan yang disematkan
        otherNotesList.innerHTML = '';  // Bersihkan daftar catatan lainnya

        const pinnedNotes = notes.filter(note => note.pinned);
        const regularNotes = notes.filter(note => !note.pinned);

        // Tampilkan pesan kosong jika tidak ada catatan
        document.getElementById('emptyPinnedNotesMessage').style.display = pinnedNotes.length === 0 ? 'block' : 'none';
        document.getElementById('emptyOtherNotesMessage').style.display = regularNotes.length === 0 ? 'block' : 'none';

        pinnedNotes.forEach(note => {
            const noteDiv = createNoteElement(note);
            pinnedNotesList.appendChild(noteDiv);
        });

        regularNotes.forEach(note => {
            const noteDiv = createNoteElement(note);
            otherNotesList.appendChild(noteDiv);
        });
    };

    const createNoteElement = (note) => {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note-item');
        if (note.pinned) {
            noteDiv.classList.add('pinned');
        }

        noteDiv.innerHTML = `
            <p class="note-content">${note.content}</p>
            <div class="note-actions">
                <button class="pin-button" data-id="${note.id}" title="${note.pinned ? 'Lepas Sematan' : 'Sematkan Catatan'}">
                    <i class="fas fa-thumbtack ${note.pinned ? 'pinned' : ''}"></i>
                </button>
                <button class="delete-button" data-id="${note.id}" title="Hapus Catatan">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Event listener untuk tombol hapus
        noteDiv.querySelector('.delete-button').addEventListener('click', (e) => {
            const idToDelete = e.currentTarget.dataset.id;
            notes = notes.filter(note => note.id !== idToDelete);
            saveNotes();
            renderNotes();
        });

        // Event listener untuk tombol sematkan/lepas sematan
        noteDiv.querySelector('.pin-button').addEventListener('click', (e) => {
            const idToPin = e.currentTarget.dataset.id;
            const targetNote = notes.find(note => note.id === idToPin);
            if (targetNote) {
                targetNote.pinned = !targetNote.pinned; // Toggle status pinned
                saveNotes();
                renderNotes();
            }
        });

        return noteDiv;
    };

    // Event listener untuk tombol 'Tambah Catatan'
    addNoteButton.addEventListener('click', () => {
        const content = noteInput.value.trim();
        if (content) {
            const newNote = {
                id: Date.now().toString(), // ID unik berdasarkan timestamp
                content: content,
                createdAt: new Date().toISOString(), // Tanggal pembuatan
                pinned: false // Default tidak disematkan
            };
            notes.push(newNote);
            saveNotes();
            renderNotes();
            noteInput.value = ''; // Bersihkan input setelah menambah
        } else {
            alert('Catatan tidak boleh kosong!');
        }
    });

    renderNotes(); // Render catatan saat DOM dimuat


    // --- 5. Fungsionalitas Keuangan Berkelanjutan ---
    let transactions = JSON.parse(localStorage.getItem('transactions')) || []; // Muat transaksi dari localStorage

    const saveTransactions = () => {
        localStorage.setItem('transactions', JSON.stringify(transactions)); // Simpan transaksi ke localStorage
    };

    const calculateSummary = () => {
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        });

        const netBalance = totalIncome - totalExpense;

        totalIncomeDisplay.textContent = `Rp${totalIncome.toLocaleString('id-ID')}`;
        totalExpenseDisplay.textContent = `Rp${totalExpense.toLocaleString('id-ID')}`;
        netBalanceDisplay.textContent = `Rp${netBalance.toLocaleString('id-ID')}`;
    };

    const renderTransactions = () => {
        transactionHistoryBody.innerHTML = ''; // Bersihkan tabel riwayat

        // Urutkan transaksi berdasarkan tanggal terbaru
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (transactions.length === 0) {
            const row = transactionHistoryBody.insertRow();
            row.classList.add('empty-message-row'); // Tambahkan class untuk styling
            row.innerHTML = `<td colspan="5"><p class="empty-message">Belum ada riwayat transaksi.</p></td>`;
        } else {
            transactions.forEach(t => {
                const row = transactionHistoryBody.insertRow();
                row.innerHTML = `
                    <td>${new Date(t.date).toLocaleDateString('id-ID')}</td>
                    <td>${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
                    <td>${t.description}</td>
                    <td class="${t.type === 'income' ? 'text-green' : 'text-red'}">Rp${t.amount.toLocaleString('id-ID')}</td>
                    <td>
                        <button class="delete-button" data-id="${t.id}" title="Hapus Transaksi">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                // Event listener untuk tombol hapus transaksi
                row.querySelector('.delete-button').addEventListener('click', (e) => {
                    const idToDelete = e.currentTarget.dataset.id;
                    transactions = transactions.filter(trans => trans.id !== idToDelete);
                    saveTransactions();
                    renderTransactions(); // Render ulang tabel
                    calculateSummary();   // Hitung ulang ringkasan
                });
            });
        }
        calculateSummary(); // Hitung ulang ringkasan setiap kali render transaksi
    };

    // Event listener untuk tombol 'Tambah Transaksi'
    addTransactionButton.addEventListener('click', () => {
        const description = transactionDescription.value.trim();
        let amount = parseFloat(transactionAmount.value.trim());
        const type = transactionType.value;

        if (description && !isNaN(amount) && amount > 0) {
            const newTransaction = {
                id: Date.now().toString(),
                description: description,
                amount: amount,
                type: type,
                date: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
            };
            transactions.push(newTransaction);
            saveTransactions();
            renderTransactions(); // Render ulang tabel dan ringkasan
            transactionDescription.value = ''; // Bersihkan input
            transactionAmount.value = '';     // Bersihkan input
        } else {
            alert('Harap isi deskripsi dan jumlah yang valid (lebih dari 0).');
        }
    });

    renderTransactions(); // Render transaksi dan ringkasan saat DOM dimuat


    // --- 6. Fungsionalitas Saran Produk Go Green ---
    const renderProductCategories = () => {
        categoryGrid.innerHTML = ''; // Bersihkan grid kategori
        productCategories.forEach(category => {
            const card = document.createElement('div');
            card.classList.add('category-card');
            card.dataset.category = category.name; // Simpan nama kategori sebagai data
            card.innerHTML = `
                <i class="${category.icon}"></i>
                <h3>${category.name}</h3>
            `;
            categoryGrid.appendChild(card);

            // Event listener untuk kartu kategori
            card.addEventListener('click', () => {
                renderProductsByCategory(category.name);
            });
        });
    };

    const renderProductsByCategory = (categoryName) => {
        productList.innerHTML = ''; // Bersihkan daftar produk

        const filteredProducts = greenProductsData.filter(p => p.category === categoryName);

        productListingTitle.textContent = `Produk: ${categoryName}`; // Update judul di halaman daftar produk
        showPage(productListingsPage, `Produk: ${categoryName}`); // Pindah ke halaman daftar produk

        if (filteredProducts.length === 0) {
            productList.innerHTML = '<p class="empty-message">Tidak ada produk dalam kategori ini.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            card.dataset.productId = product.id; // Simpan ID produk sebagai data
            card.innerHTML = `
                <h4>${product.name}</h4>
                <p>${product.shortDesc}</p>
            `;
            productList.appendChild(card);

            // Event listener untuk kartu produk
            card.addEventListener('click', () => {
                showProductDetail(product.id);
            });
        });
    };

    const showProductDetail = (productId) => {
        const product = greenProductsData.find(p => p.id === productId);
        // Pastikan produk dan properti 'details' ada
        if (!product || !product.details) {
            console.error('Produk atau detail produk tidak ditemukan:', productId);
            alert('Detail produk tidak dapat dimuat.');
            return;
        }

        // Mengisi elemen-elemen detail produk dengan data
        productNameDetail.textContent = product.name;

        // Render Sertifikasi
        productCertifications.innerHTML = '';
        if (product.details.certifications && product.details.certifications.length > 0) {
            product.details.certifications.forEach(cert => {
                const span = document.createElement('span');
                span.classList.add('certification-tag');
                span.textContent = cert;
                productCertifications.appendChild(span);
            });
        } else {
            productCertifications.innerHTML = '<span class="certification-tag">Tidak Ada Sertifikasi Khusus</span>';
        }

        // Menggunakan innerHTML untuk mendukung tag <br> dan <a> pada teks DIY
        productIngredients.innerHTML = product.details.ingredients || '<p class="empty-message">Tidak ada informasi.</p>';
        productProduction.innerHTML = product.details.production || '<p class="empty-message">Tidak ada informasi.</p>';
        productImpact.innerHTML = product.details.impact || '<p class="empty-message">Tidak ada informasi.</p>';
        productDIY.innerHTML = product.details.diy || '<p class="empty-message">Tidak ada informasi.</p>'; // Ini yang berisi link Shopee

        showPage(productDetailPage, product.name); // Pindah ke halaman detail produk
    };

    // Panggil fungsi renderCategories saat DOM dimuat untuk menampilkan kategori di halaman saran produk
    renderProductCategories();
});
