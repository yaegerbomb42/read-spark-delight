// Simple script to reset localStorage for development
console.log("Clearing book data from localStorage...");
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('myBooks');
  localStorage.removeItem('defaultBooksLoaded');
  console.log("Book data cleared!");
} else {
  console.log("localStorage not available");
}