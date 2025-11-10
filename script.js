// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {

    // Get references to our HTML elements
    const inputEl = document.getElementById("data-input");
    const unitEl = document.getElementById("unit-select");
    const generateBtn = document.getElementById("generate-btn");
    const showMoreBtn = document.getElementById("show-more-btn");
    const vizContainer = document.getElementById("visualization-container");
    const messageContainer = document.getElementById("message-container");
    const disableCapCheck = document.getElementById("disable-cap-check"); 

    // --- Configuration ---
    const INITIAL_MAX_BITS = 200000;
    const BITS_TO_ADD = 100000;
    const ANIMATION_DURATION = 15000; // 15 seconds in milliseconds

    // --- State Variables ---
    let totalBitsCalculated = 0;
    let currentBitsShown = 0;
    let animationFrameId = null; // To start/stop the animation loop

    // --- Event Listener for "Generate" Button ---
    generateBtn.addEventListener("click", () => {
        // 1. Stop any animation
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        // 2. Clear previous results
        vizContainer.innerHTML = "";
        messageContainer.innerHTML = "";
        showMoreBtn.style.display = "none";
        currentBitsShown = 0;
        
        // 3. Validate input
        const number = parseInt(inputEl.value, 10);
        if (isNaN(number) || number <= 0) {
            showMessage("Please enter a valid positive number.", "error");
            return;
        }

        // 4. Calculate total bits
        const unit = unitEl.value;
        totalBitsCalculated = calculateTotalBits(number, unit);

        // 5. Determine the cap (based on checkbox)
        const isCapDisabled = disableCapCheck.checked;
        const currentMaxBits = isCapDisabled ? Infinity : INITIAL_MAX_BITS;

        // 6. Determine bits for this first batch and start animation
        const bitsForFirstBatch = Math.min(totalBitsCalculated, currentMaxBits);
        
        if (bitsForFirstBatch === 0) {
             showMessage("Total is 0 bits.", "info");
             return;
        }

        showMessage("Generating visualization...", "info");
        // Pass the 'isCapDisabled' flag to the animation function
        startAnimation(bitsForFirstBatch, isCapDisabled);
    });

    // --- Event Listener for "Show More" Button ---
    showMoreBtn.addEventListener("click", () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        const remainingBits = totalBitsCalculated - currentBitsShown;
        const bitsToAdd = Math.min(BITS_TO_ADD, remainingBits);
        if (bitsToAdd <= 0) return;
        
        showMessage(`Adding ${bitsToAdd.toLocaleString()} more bits...`, "info");
        startAnimation(bitsToAdd, false); // 'false' because cap was clearly not disabled
    });

    /**
     * Animates the addition of squares.
     * @param {number} bitsInThisBatch - The number of bits to add.
     * @param {boolean} isCapDisabled - Flag to know if we should check for "Show More".
     */
    function startAnimation(bitsInThisBatch, isCapDisabled = false) { 
        let startTime = null;
        let bitsAddedForThisBatch = 0;

        function animationStep(timestamp) {
            if (startTime === null) {
                startTime = timestamp; 
            }
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
            const targetBitsToShow = Math.floor(progress * bitsInThisBatch);
            const newBitsToAdd = targetBitsToShow - bitsAddedForThisBatch;

            if (newBitsToAdd > 0) {
                const frameFragment = document.createDocumentFragment();
                for (let i = 0; i < newBitsToAdd; i++) {
                    const square = document.createElement("div");
                    square.className = "bit-square";
                    frameFragment.appendChild(square);
                }
                vizContainer.appendChild(frameFragment);
                bitsAddedForThisBatch += newBitsToAdd;
            }

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animationStep);
            } else {
                // --- Animation is Complete ---
                animationFrameId = null;
                currentBitsShown += bitsAddedForThisBatch;

                // Updated message logic
                if (isCapDisabled || currentBitsShown >= totalBitsCalculated) {
                    // If cap was disabled OR we've reached the total, we are done.
                    showMessage(`Showing all ${currentBitsShown.toLocaleString()} bits.`, "success");
                    showMoreBtn.style.display = "none";
                } else {
                    // Cap is enabled AND we haven't shown all bits yet.
                    showMessage(`Showing ${currentBitsShown.toLocaleString()} of ${totalBitsCalculated.toLocaleString()} bits.`, "info");
                    showMoreBtn.style.display = "inline-block";
                }
            }
        }
        animationFrameId = requestAnimationFrame(animationStep);
    }

    /**
     * Calculates the total number of bits based on the number and unit.
     */
    function calculateTotalBits(number, unit) {
        switch (unit) {
            case "b":  return number;                     // Bits
            case "B":  return number * 8;                 // Bytes
            case "Kb": return number * 1000;              // Kilobits
            case "KB": return number * 1024 * 8;          // Kilobytes (1024 * 8)
            case "Mb": return number * 1000 * 1000;       // Megabits
            case "MB": return number * 1024 * 1024 * 8;   // Megabytes (1024 * 1024 * 8)
            default:   return 0;
        }
    }

    /**
     * Displays a message to the user.
     * type can be 'error', 'success', or 'info'
     */
    function showMessage(message, type) {
        messageContainer.textContent = message;
        messageContainer.classList.remove("message-error", "message-success", "message-info");
        messageContainer.classList.add(`message-${type}`);
    }
});
