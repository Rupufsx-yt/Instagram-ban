// Matrix Rain Effect
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*/?";
const charArray = chars.split("");
const font_size = 14;
const columns = canvas.width / font_size;
const drops = [];

for (let x = 0; x < columns; x++) {
    drops[x] = Math.random() * canvas.height;
}

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#00FF00";
    ctx.font = font_size + "px monospace";
    
    for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * font_size, drops[i] * font_size);
        
        if (drops[i] * font_size > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 35);

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        showSection(sectionId);
    });
});

// Attack System
let attackInProgress = false;
let attackInterval;
let currentStats = {
    success: 0,
    failed: 0,
    total: 0,
    startTime: 0
};

function launchAttack() {
    if (attackInProgress) {
        addLog("⚠️ Attack already in progress!");
        return;
    }
    
    const username = document.getElementById('username').value.trim();
    const reportCount = parseInt(document.getElementById('reportCount').value);
    const reason = document.getElementById('reportReason').value;
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    if (!username) {
        addLog("❌ Please enter a username!");
        return;
    }
    
    if (reportCount < 1 || reportCount > 1000) {
        addLog("❌ Invalid report count!");
        return;
    }
    
    // Show progress section
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('launchAttack').disabled = true;
    
    // Reset stats
    currentStats = { success: 0, failed: 0, total: 0, startTime: Date.now() };
    updateProgress();
    
    attackInProgress = true;
    addLog(`🚀 Starting attack on @${username}`);
    addLog(`💣 Mode: ${mode.toUpperCase()} | Reports: ${reportCount} | Reason: ${reason}`);
    
    // Simulate attack (replace with actual API call)
    simulateAttack(username, reportCount, mode);
}

function simulateAttack(username, totalReports, mode) {
    const speeds = {
        stealth: { interval: 2000, batch: 1 },
        rapid: { interval: 500, batch: 5 },
        nuclear: { interval: 100, batch: 10 }
    };
    
    const speed = speeds[mode];
    let sentReports = 0;
    
    attackInterval = setInterval(() => {
        if (sentReports >= totalReports || !attackInProgress) {
            completeAttack();
            return;
        }
        
        const batchSize = Math.min(speed.batch, totalReports - sentReports);
        
        for (let i = 0; i < batchSize; i++) {
            sentReports++;
            
            // Simulate report success (80% success rate)
            const success = Math.random() < 0.8;
            
            if (success) {
                currentStats.success++;
                addLog(`✅ Report ${sentReports}/${totalReports} sent successfully`);
            } else {
                currentStats.failed++;
                addLog(`❌ Report ${sentReports}/${totalReports} failed`);
            }
            
            currentStats.total++;
            updateProgress();
        }
        
    }, speed.interval);
}

function stopAttack() {
    if (attackInProgress) {
        attackInProgress = false;
        clearInterval(attackInterval);
        addLog("🛑 Attack stopped by user");
        document.getElementById('launchAttack').disabled = false;
    }
}

function completeAttack() {
    attackInProgress = false;
    clearInterval(attackInterval);
    
    const successRate = ((currentStats.success / currentStats.total) * 100).toFixed(1);
    const duration = Math.round((Date.now() - currentStats.startTime) / 1000);
    
    addLog(`🎉 Attack completed!`);
    addLog(`📊 Results: ${currentStats.success} successful, ${currentStats.failed} failed`);
    addLog(`📈 Success rate: ${successRate}% in ${duration}s`);
    
    document.getElementById('launchAttack').disabled = false;
    
    // Update statistics
    updateStatistics();
}

function updateProgress() {
    const progress = (currentStats.total / parseInt(document.getElementById('reportCount').value)) * 100;
    
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = progress.toFixed(1) + '%';
    
    document.getElementById('successCount').textContent = currentStats.success;
    document.getElementById('failedCount').textContent = currentStats.failed;
    document.getElementById('totalCount').textContent = currentStats.total;
    
    const duration = Math.round((Date.now() - currentStats.startTime) / 1000);
    document.getElementById('timeElapsed').textContent = duration + 's';
}

function addLog(message) {
    const log = document.getElementById('attackLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function updateStatistics() {
    // This would connect to your backend API
    // For now, we'll simulate some data
    document.getElementById('totalAttacks').textContent = 
        parseInt(document.getElementById('totalAttacks').textContent) + 1;
    
    document.getElementById('totalReports').textContent = 
        parseInt(document.getElementById('totalReports').textContent) + currentStats.total;
    
    const successRate = ((currentStats.success / currentStats.total) * 100).toFixed(1);
    document.getElementById('successRate').textContent = successRate + '%';
    
    // Add to recent attacks
    const recentList = document.getElementById('recentAttacks');
    const attackItem = document.createElement('div');
    attackItem.className = 'attack-item';
    attackItem.innerHTML = `
        <strong>@${document.getElementById('username').value}</strong> 
        - ${currentStats.total} reports 
        - ${successRate}% success 
        - ${new Date().toLocaleString()}
    `;
    recentList.insertBefore(attackItem, recentList.firstChild);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add sample recent attacks
    const sampleAttacks = [
        { target: "example_user", reports: 250, success: 85, date: "2024-01-15 14:30" },
        { target: "test_account", reports: 100, success: 92, date: "2024-01-15 10:15" }
    ];
    
    sampleAttacks.forEach(attack => {
        const attackItem = document.createElement('div');
        attackItem.className = 'attack-item';
        attackItem.innerHTML = `
            <strong>@${attack.target}</strong> 
            - ${attack.reports} reports 
            - ${attack.success}% success 
            - ${attack.date}
        `;
        document.getElementById('recentAttacks').appendChild(attackItem);
    });
});
