document.addEventListener("DOMContentLoaded", function () {
  const inputBookForm = document.getElementById("inputBook");
  const searchBookForm = document.getElementById("searchBook");
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );

  // Melakukan Generate ID Unik berdasarkan timestamp
  function generateId() {
    return +new Date(); // Returns timestamp as a unique numeric ID
  }

  // Render buku ke rak masing-masing (tidak lengkap atau lengkap)
  function renderBook(book) {
    const bookItem = document.createElement("article");
    bookItem.classList.add("book_item");
    bookItem.setAttribute("data-id", book.id);

    bookItem.innerHTML = `
      <h3>${book.title}</h3>
      <p>Penulis: ${book.author}</p>
      <p>Tahun: ${book.year}</p>
      <div class="action">
        <button class="green">${
          book.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"
        }</button>
        <button class="red">Hapus buku</button>
      </div>
    `;

    const toggleButton = bookItem.querySelector(".green");
    const deleteButton = bookItem.querySelector(".red");

    toggleButton.addEventListener("click", function () {
      toggleBookStatus(book);
    });

    deleteButton.addEventListener("click", function () {
      deleteBook(book);
    });

    const shelfList = book.isComplete
      ? completeBookshelfList
      : incompleteBookshelfList;
    shelfList.appendChild(bookItem);
  }

  // Alihkan status buku antara lengkap dan tidak lengkap
  function toggleBookStatus(book) {
    book.isComplete = !book.isComplete;

    // Perbarui data Penyimpanan lokal
    updateLocalStorage(book.id);

    // Hapus item buku dari rak saat ini
    const shelfList = book.isComplete
      ? incompleteBookshelfList
      : completeBookshelfList;
    const bookItem = shelfList.querySelector(`[data-id="${book.id}"]`);
    shelfList.removeChild(bookItem);

    // Render ulang item buku ke rak baru
    renderBook(book);
  }

  // Hapus buku dari rak
  function deleteBook(book) {
    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus buku "${book.title}"?`
    );
    if (confirmDelete) {
      const shelfList = book.isComplete
        ? completeBookshelfList
        : incompleteBookshelfList;
      const bookItem = shelfList.querySelector(`[data-id="${book.id}"]`);
      shelfList.removeChild(bookItem);

      // Hapus buku dari Penyimpanan lokal
      removeBookFromLocalStorage(book.id);
    }
  }

  // Menangani pengiriman formulir untuk menambah buku baru
  inputBookForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = parseInt(document.getElementById("inputBookYear").value);
    const isComplete = document.getElementById("inputBookIsComplete").checked;

    const newBook = {
      id: generateId(),
      title,
      author,
      year,
      isComplete,
    };

    // Simpan buku baru ke Penyimpanan lokal
    saveBookToLocalStorage(newBook);

    // Setel ulang kolom formulir
    inputBookForm.reset();

    // Render buku baru ke rak masing-masing
    renderBook(newBook);
  });

  // Simpan data buku ke Penyimpanan lokal
  function saveBookToLocalStorage(book) {
    let books = [];
    if (localStorage.getItem("books")) {
      books = JSON.parse(localStorage.getItem("books"));
    }

    books.push(book);
    localStorage.setItem("books", JSON.stringify(books));
  }

  // Hapus data buku dari Penyimpanan lokal
  function removeBookFromLocalStorage(id) {
    let books = [];
    if (localStorage.getItem("books")) {
      books = JSON.parse(localStorage.getItem("books"));
      books = books.filter((book) => book.id !== id);
      localStorage.setItem("books", JSON.stringify(books));
    }
  }

  // Perbarui data Penyimpanan lokal setelah mengubah status buku
  function updateLocalStorage(id) {
    let books = [];
    if (localStorage.getItem("books")) {
      books = JSON.parse(localStorage.getItem("books"));
      books.forEach((book, index) => {
        if (book.id === id) {
          books[index].isComplete = !books[index].isComplete;
        }
      });
      localStorage.setItem("books", JSON.stringify(books));
    }
  }

  // Muat buku dari Penyimpanan lokal saat memuat halaman
  function loadBooks() {
    let books = [];
    if (localStorage.getItem("books")) {
      books = JSON.parse(localStorage.getItem("books"));
      books.forEach((book) => renderBook(book));
    }
  }

  // Fungsi untuk mencari buku berdasarkan judul
  function searchBooks(title) {
    let books = [];
    if (localStorage.getItem("books")) {
      books = JSON.parse(localStorage.getItem("books"));
      const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(title.toLowerCase())
      );

      // Kosongkan rak buku sebelum menampilkan hasil pencarian
      incompleteBookshelfList.innerHTML = "";
      completeBookshelfList.innerHTML = "";

      // Render ulang buku yang sesuai dengan hasil pencarian
      filteredBooks.forEach((book) => renderBook(book));
    }
  }

  // Tangani pengiriman formulir pencarian
  searchBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchTitle = document.getElementById("searchBookTitle").value;
    searchBooks(searchTitle);
  });

  // Inisialisasi aplikasi dengan memuat buku dari Penyimpanan lokal
  loadBooks();
});
