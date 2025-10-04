// Exo-Scan AI JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const removeFileBtn = document.getElementById('remove-file');
    const analyzeFileBtn = document.getElementById('analyze-file');
    const analyzeManualBtn = document.getElementById('analyze-manual');
    const meterCanvas = document.getElementById('meter-canvas');
    const meterValue = document.getElementById('meter-value');
    const resultDetails = document.getElementById('result-details');
    const modelTabs = document.querySelectorAll('.model-tab');
    const selectedModelName = document.getElementById('selected-model-name');

    let uploadedFile = null;
    let selectedModel = 'logistic';
    const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB in bytes

    const modelNames = {
        'logistic': 'Logistic Regression',
        'random-forest': 'Random Forest',
        'gradient-boosting': 'Gradient Boosting',
        'lightgbm': 'LightGBM'
    };

    // Initialize meter
    drawMeter(0);

    // Model tab selection
    modelTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            modelTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            selectedModel = this.getAttribute('data-model');
            selectedModelName.textContent = modelNames[selectedModel];
        });
    });

    // File upload area click
    fileUploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        handleFileSelect(e.target.files[0]);
    });

    // Drag and drop functionality
    fileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        handleFileSelect(e.dataTransfer.files[0]);
    });

    // Remove file button
    removeFileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        removeFile();
    });

    // Analyze buttons
    analyzeManualBtn.addEventListener('click', function() {
        analyzeManualData();
    });

    analyzeFileBtn.addEventListener('click', function() {
        analyzeCSVFile();
    });

    // Handle file selection
    function handleFileSelect(file) {
        if (!file) return;

        // Check if file is CSV
        if (!file.name.endsWith('.csv')) {
            showError('Please upload a CSV file only.');
            return;
        }

        // Check file size (max 16MB)
        if (file.size > MAX_FILE_SIZE) {
            showError('File size exceeds 16MB limit. Please upload a smaller file.');
            return;
        }

        uploadedFile = file;
        fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;
        fileUploadArea.style.display = 'none';
        fileInfo.style.display = 'flex';
        analyzeFileBtn.style.display = 'block';
    }

    // Remove file
    function removeFile() {
        uploadedFile = null;
        fileInput.value = '';
        fileUploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        analyzeFileBtn.style.display = 'none';
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Show error message
    function showError(message) {
        resultDetails.innerHTML = `<p class="result-text" style="color: #ef4444;">${message}</p>`;
    }

    // Analyze manual data
    function analyzeManualData() {
        const stellarEclipseFlag = document.getElementById('stellar-eclipse-flag').value;
        const notTransitLike = document.getElementById('not-transit-like').value;
        const centroidOffset = document.getElementById('centroid-offset').value;
        const transitDuration = document.getElementById('transit-duration').value;
        const numPlanets = document.getElementById('num-planets').value;
        const transitEpoch = document.getElementById('transit-epoch').value;
        const contaminationFlag = document.getElementById('contamination-flag').value;
        const kicRa = document.getElementById('kic-ra').value;

        if (!stellarEclipseFlag || !notTransitLike || !centroidOffset || !transitDuration || 
            !numPlanets || !transitEpoch || !contaminationFlag || !kicRa) {
            showError('Please fill in all fields before analyzing.');
            return;
        }

        // Simulate analysis (in real app, this would call your ML model)
        const score = calculateConfidenceScore(
            stellarEclipseFlag, notTransitLike, centroidOffset, transitDuration, 
            numPlanets, transitEpoch, contaminationFlag, kicRa
        );
        animateMeter(score);
        
        displayResults(score, {
            model: modelNames[selectedModel],
            stellarEclipseFlag,
            notTransitLike,
            centroidOffset,
            transitDuration,
            numPlanets,
            transitEpoch,
            contaminationFlag,
            kicRa
        });
    }

    // Analyze CSV file
    function analyzeCSVFile() {
        if (!uploadedFile) return;

        // Show loading state
        resultDetails.innerHTML = '<p class="result-text">Analyzing CSV data...</p>';
        
        // Read CSV file
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const lines = content.split('\n');
            
            // Simulate analysis
            const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
            animateMeter(score);
            
            displayResults(score, {
                model: modelNames[selectedModel],
                fileName: uploadedFile.name,
                rows: lines.length - 1,
                isCSV: true
            });
        };
        reader.readAsText(uploadedFile);
    }

    // Calculate confidence score (simple heuristic for demo)
    function calculateConfidenceScore(eclipseFlag, notTransit, centroid, duration, planets, epoch, contamination, ra) {
        // Simple scoring algorithm (in real app, use your ML model)
        let score = 50;
        
        // Flags analysis (inverted - lower flags suggest better exoplanet candidate)
        if (eclipseFlag == 0) score += 15;
        if (notTransit == 0) score += 15;
        if (centroid == 0) score += 10;
        if (contamination == 0) score += 10;
        
        // Transit duration check (reasonable range)
        if (duration >= 1 && duration <= 10) score += 10;
        
        // Number of planets (multi-planet systems are interesting)
        if (planets >= 1 && planets <= 5) score += 5;
        
        // Add some randomness for demo
        score += Math.floor(Math.random() * 15) - 5;
        
        return Math.min(100, Math.max(0, score));
    }

    // Draw meter on canvas
    function drawMeter(value) {
        const ctx = meterCanvas.getContext('2d');
        const centerX = 150;
        const centerY = 150;
        const radius = 120;
        const startAngle = Math.PI;
        const endAngle = 2 * Math.PI;
        
        // Clear canvas
        ctx.clearRect(0, 0, meterCanvas.width, meterCanvas.height);
        
        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 20;
        ctx.stroke();
        
        // Draw value arc
        const valueAngle = startAngle + (endAngle - startAngle) * (value / 100);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
        
        // Color gradient based on value
        const gradient = ctx.createLinearGradient(0, 0, 300, 0);
        if (value < 40) {
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(1, '#f97316');
        } else if (value < 70) {
            gradient.addColorStop(0, '#f59e0b');
            gradient.addColorStop(1, '#eab308');
        } else {
            gradient.addColorStop(0, '#22c55e');
            gradient.addColorStop(1, '#10b981');
        }
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    // Animate meter
    function animateMeter(targetValue) {
        let currentValue = 0;
        const increment = targetValue / 50;
        
        const animation = setInterval(function() {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(animation);
            }
            drawMeter(currentValue);
            meterValue.textContent = Math.round(currentValue);
        }, 20);
    }

    // Display results
    function displayResults(score, data) {
        let classification = '';
        let message = '';
        
        if (score >= 80) {
            classification = 'High Confidence';
            message = 'This object shows strong characteristics of an exoplanet candidate.';
        } else if (score >= 60) {
            classification = 'Moderate Confidence';
            message = 'This object shows moderate characteristics of an exoplanet candidate. Further observation recommended.';
        } else if (score >= 40) {
            classification = 'Low Confidence';
            message = 'This object shows weak characteristics of an exoplanet candidate. Additional data needed.';
        } else {
            classification = 'Very Low Confidence';
            message = 'This object is unlikely to be an exoplanet candidate.';
        }
        
        let detailsHTML = `
            <p class="result-text">
                <strong>Model Used:</strong> ${data.model || modelNames[selectedModel]}<br>
                <strong>Classification:</strong> ${classification}<br>
                <strong>Confidence Score:</strong> ${score}/100<br><br>
                ${message}
            </p>
        `;
        
        if (data.isCSV) {
            detailsHTML += `<p class="result-text" style="margin-top: 1rem;">
                <strong>File:</strong> ${data.fileName}<br>
                <strong>Rows Processed:</strong> ${data.rows}
            </p>`;
        }
        
        resultDetails.innerHTML = detailsHTML;
    }
});