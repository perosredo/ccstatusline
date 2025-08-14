const fs = require('fs');

const transcriptPath = process.argv[2] || '/home/petar/.claude/projects/-home-petar-PROJECTS/c1d291a8-c9fc-46d0-a3c8-e6afbc7238ff.jsonl';

console.log('Testing file:', transcriptPath);
console.log('File exists:', fs.existsSync(transcriptPath));

if (fs.existsSync(transcriptPath)) {
    const content = fs.readFileSync(transcriptPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    console.log('Total lines:', lines.length);
    
    let firstTimestamp = null;
    let lastTimestamp = null;
    
    for (const line of lines) {
        if (!line.includes('"timestamp"')) continue;
        
        const timestampMatch = line.match(/"timestamp"\s*:\s*"([^"]+)"/);
        if (timestampMatch && timestampMatch[1]) {
            const timestamp = new Date(timestampMatch[1]);
            if (!firstTimestamp) {
                firstTimestamp = timestamp;
            }
            lastTimestamp = timestamp;
        }
    }
    
    console.log('First timestamp:', firstTimestamp);
    console.log('Last timestamp:', lastTimestamp);
    
    if (firstTimestamp && lastTimestamp) {
        const now = new Date();
        const BLOCK_DURATION_MS = 5 * 60 * 60 * 1000;
        
        // Check if last activity was recent
        const timeSinceLastActivity = now.getTime() - lastTimestamp.getTime();
        console.log('Time since last activity (ms):', timeSinceLastActivity);
        console.log('Is active (< 5hrs)?:', timeSinceLastActivity < BLOCK_DURATION_MS);
        
        if (timeSinceLastActivity > BLOCK_DURATION_MS) {
            console.log('No active block - last activity was too long ago');
        } else {
            // Find block start
            let blockStart = new Date(lastTimestamp);
            blockStart.setUTCMinutes(0, 0, 0);
            
            console.log('Initial block start (floored):', blockStart);
            
            // Adjust if needed
            while (lastTimestamp.getTime() - blockStart.getTime() > BLOCK_DURATION_MS) {
                blockStart = new Date(blockStart.getTime() + BLOCK_DURATION_MS);
                console.log('Adjusted block start:', blockStart);
            }
            
            const blockEnd = new Date(blockStart.getTime() + BLOCK_DURATION_MS);
            console.log('Block end:', blockEnd);
            
            const remainingMs = blockEnd.getTime() - now.getTime();
            console.log('Remaining (ms):', remainingMs);
            
            if (remainingMs <= 0) {
                console.log('Block expired');
            } else {
                const totalMinutes = Math.floor(remainingMs / (1000 * 60));
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                
                let result;
                if (hours === 0) {
                    result = `${minutes}m`;
                } else if (minutes === 0) {
                    result = `${hours}hr`;
                } else {
                    result = `${hours}hr ${minutes}m`;
                }
                console.log('RESULT:', result);
            }
        }
    }
}