document.addEventListener('DOMContentLoaded', () => {
    // --- PWA Service Worker Registration ---
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

    // --- DOM Elements ---
    const appContent = document.getElementById('app-content');
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.getElementById('side-menu');
    const navLinks = document.querySelectorAll('.side-menu a');
    const backButtons = document.querySelectorAll('.back-button');

    // --- Page Management ---
    let currentPage = 'home';

    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId + '-page').classList.add('active');
        currentPage = pageId;
        sideMenu.classList.remove('active'); // Close menu on page change
    }

    // --- Event Listeners for Navigation ---
    menuToggle.addEventListener('click', () => {
        sideMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            showPage(page);
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetPage = e.currentTarget.dataset.target;
            showPage(targetPage);
            // Specific logic for product detail back button
            if (targetPage === 'product-list') {
                const categoryTitle = document.getElementById('product-list-category-title').textContent;
                const category = categoryTitle.replace('Produk Kategori: ', '');
                renderProductsByCategory(category);
            }
        });
    });

    // --- Catatan & Pengingat Functionality ---
    const noteText = document.getElementById('note-text');
    const addNoteButton = document.getElementById('add-note-button');
    const pinnedNotesContainer = document.getElementById('pinned-notes-container');
    const otherNotesContainer = document.getElementById('other-notes-container');
    const emptyPinnedNotesMessage = document.getElementById('empty-pinned-notes-message');
    const emptyOtherNotesMessage = document.getElementById('empty-other-notes-message');

    let notes = loadNotes(); // Load notes on app start

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function loadNotes() {
        const storedNotes = localStorage.getItem('notes');
        return storedNotes ? JSON.parse(storedNotes) : [];
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

        // Event listener for delete button
        noteDiv.querySelector('.delete-button').addEventListener('click', (e) => {
            const idToDelete = e.currentTarget.dataset.id;
            notes = notes.filter(note => note.id !== idToDelete);
            saveNotes();
            renderNotes();
        });

        // Event listener for pin button
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

    function renderNotes() {
        pinnedNotesContainer.innerHTML = ''; // Clear current content
        otherNotesContainer.innerHTML = ''; // Clear current content

        const pinnedNotes = notes.filter(note => note.pinned);
        const otherNotes = notes.filter(note => !note.pinned);

        if (pinnedNotes.length === 0) {
            // Memastikan elemen ada sebelum mengakses style
            if (emptyPinnedNotesMessage) { 
                emptyPinnedNotesMessage.style.display = 'block';
            }
        } else {
            if (emptyPinnedNotesMessage) {
                emptyPinnedNotesMessage.style.display = 'none';
            }
            pinnedNotes.forEach(note => {
                pinnedNotesContainer.appendChild(createNoteElement(note));
            });
        }

        if (otherNotes.length === 0) {
            // Memastikan elemen ada sebelum mengakses style
            if (emptyOtherNotesMessage) {
                emptyOtherNotesMessage.style.display = 'block';
            }
        } else {
            if (emptyOtherNotesMessage) {
                emptyOtherNotesMessage.style.display = 'none';
            }
            otherNotes.forEach(note => {
                otherNotesContainer.appendChild(createNoteElement(note));
            });
        }
    }

    addNoteButton.addEventListener('click', () => {
        const text = noteText.value.trim();
        if (text) {
            const newNote = {
                id: Date.now().toString(),
                text: text,
                pinned: false
            };
            notes.push(newNote);
            saveNotes();
            renderNotes();
            noteText.value = ''; // Clear input field
        }
    });

    // Initialize notes display on page load
    renderNotes();


    // --- Keuangan Berkelanjutan Functionality ---
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const currentBalanceEl = document.getElementById('current-balance');
    const transactionDescriptionInput = document.getElementById('transaction-description');
    const transactionAmountInput = document.getElementById('transaction-amount');
    const transactionTypeSelect = document.getElementById('transaction-type');
    const addTransactionButton = document.getElementById('add-transaction-button');
    const transactionList = document.getElementById('transaction-list');

    let transactions = loadTransactions(); // Load transactions on app start

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function loadTransactions() {
        const storedTransactions = localStorage.getItem('transactions');
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

        totalIncomeEl.textContent = formatCurrency(totalIncome);
        totalExpenseEl.textContent = formatCurrency(totalExpense);
        currentBalanceEl.textContent = formatCurrency(currentBalance);

        // Change balance color based on value
        if (currentBalance < 0) {
            currentBalanceEl.style.color = '#F44336'; // Red
        } else {
            currentBalanceEl.style.color = '#21D4FD'; // Blue
        }
    }

    function formatCurrency(amount) {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    }

    function renderTransactions() {
        transactionList.innerHTML = ''; // Clear current content

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

    addTransactionButton.addEventListener('click', () => {
        const description = transactionDescriptionInput.value.trim();
        const amount = parseFloat(transactionAmountInput.value);
        const type = transactionTypeSelect.value;

        if (description && !isNaN(amount) && amount > 0) {
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

            // Clear input fields
            transactionDescriptionInput.value = '';
            transactionAmountInput.value = '';
            transactionTypeSelect.value = 'income';
        } else {
            alert('Harap isi deskripsi dan jumlah yang valid.');
        }
    });

    // Initialize financial display on page load
    calculateSummary();
    renderTransactions();


    // --- Saran Produk Go Green Functionality ---
    const productCategoriesGrid = document.getElementById('product-categories-grid');
    const productListContainer = document.getElementById('product-list-container');
    const productListCategoryTitle = document.getElementById('product-list-category-title');
    const productDetailContent = document.getElementById('product-detail-content');
    const homeCategoryCards = document.querySelectorAll('#home-page .category-card');

    // Data Produk (Contoh data)
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
        productCategoriesGrid.innerHTML = ''; // Clear previous content
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
        productListContainer.innerHTML = ''; // Clear previous content
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

    // Event listener for Home page category cards
    homeCategoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            renderProductsByCategory(category);
            showPage('product-list');
        });
    });

    // Initialize product categories on page load for the 'produk' page
    renderProductCategories();

    // --- Initial Page Load ---
    showPage('home'); // Show home page by default
});
