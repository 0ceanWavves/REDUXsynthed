// Client-side coverage reporting script
(function() {
    // Only run if in coverage mode
    if (window.location.search.includes('coverage=true')) {
        console.log('Coverage tracking enabled');
        
        // Capture existing coverage data if available
        window.__coverage__ = window.__coverage__ || {};
        
        // Function to send coverage data to server
        function sendCoverageData() {
            if (window.__coverage__) {
                fetch('http://localhost:3001/coverage/client', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': window.location.origin
                    },
                    mode: 'cors', // Enable CORS mode
                    credentials: 'omit', // Don't send cookies for cross-origin requests
                    body: JSON.stringify(window.__coverage__)
                })
                .then(response => {
                    if (response.ok) {
                        console.log('Coverage data sent successfully');
                    } else {
                        console.error('Failed to send coverage data:', response.statusText);
                    }
                })
                .catch(error => {
                    console.error('Error sending coverage data:', error);
                });
            } else {
                console.warn('No coverage data available');
            }
        }
        
        // Send coverage data before page unload
        window.addEventListener('beforeunload', sendCoverageData);
        
        // Also send periodically
        setInterval(sendCoverageData, 10000);
        
        // Add a manual trigger (for debugging)
        window.sendCoverageNow = sendCoverageData;
        
        console.log('Coverage reporting initialized');
    }
})(); 