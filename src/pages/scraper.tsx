// components/ImageScraper.tsx
import { useState } from 'react';

export default function ImageScraper() {
  const [url, setUrl] = useState('https://www.lathampool.com/fiberglass-pool-shapes/');
  const [className, setClassName] = useState('product-card__image__inner');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, className }),
      });
      
      const data = await response.json();
      console.log(data)
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium">
            Website URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="https://example.com"
          />
        </div>
        
        <div>
          <label htmlFor="className" className="block text-sm font-medium">
            Image Class Name
          </label>
          <input
            type="text"
            id="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="product-card__image__inner"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Scraping...' : 'Scrape Images'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {JSON.stringify(results)}

      {results && (
        <div className="mt-4 space-y-4">
          <h2 className="text-lg font-semibold">Results</h2>
          <p>Total Images Found: {results.totalImages}</p>
          <p>Successfully Downloaded: {results.successfulDownloads}</p>
          
          <div className="grid grid-cols-2 gap-4">
            {results.results.map((result: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-md ${
                  result.success ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {result.success ? (
                  <>
                    <p className="text-green-700">✓ Success</p>
                    <p className="text-sm truncate">{result.filename}</p>
                    <img
                      src={result.url}
                      alt={result.filename}
                      className="mt-2 max-w-full h-auto"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-red-700">✗ Failed</p>
                    <p className="text-sm">{result.error}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}