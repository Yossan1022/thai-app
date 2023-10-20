import React, { useState } from 'react';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  async function handleSearch() {
    try {
      const response = await fetch(`http://localhost:5001/api/words/search?q=${searchTerm}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Error searching words:", err);
    }
  }

  return (
    <div>
      <input 
        type="text" 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Search for a word or phrase"
      />
      <button onClick={handleSearch}>Search</button>
      
      <ul>
        {results.map(word => (
          <li key={word._id}>
            Thai: {word.thai}, English: {word.english}
            {/* Add more details as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchComponent;
