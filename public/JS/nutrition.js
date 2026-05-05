/**
 * Nutrition Data Access Object (DAO)
 * Designed to be modular so that you can swap out localStorage for a real database later.
 * All methods return Promises to simulate async DB calls.
 */
class NutritionDAO {
    constructor() {
        this.storageKey = 'kinetic_nutrition_data';
        
        // Initial mock state if DB is empty
        this.defaultData = {
            targetKcal: 2450,
            consumedKcal: 2070, // Remaining would be 380
            activityLevel: "Elite Athlete (6+ sessions/wk)",
            weight: 82,
            likedMeals: ['meal-2', 'fav-1', 'fav-3'] // Mock some initial liked meals
        };

        this.data = this._loadLocal();
    }

    _loadLocal() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : { ...this.defaultData };
        } catch (e) {
            console.error("Local storage error:", e);
            return { ...this.defaultData };
        }
    }

    _saveLocal() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error("Local storage error:", e);
        }
    }

    // --- API Methods ---

    async getUserNutritionData() {
        // Simulate network delay
        return new Promise(resolve => setTimeout(() => resolve({ ...this.data }), 50));
    }

    async updateTDEE(activityLevel, weight) {
        // Simulate a backend calculation based on activity and weight
        let multiplier = 20;
        if (activityLevel.includes("Elite")) multiplier = 25;
        else if (activityLevel.includes("Active")) multiplier = 22;
        else if (activityLevel.includes("Moderate")) multiplier = 20;
        else multiplier = 18;

        // Arbitrary mockup formula for visual update
        const newTarget = Math.round((weight * multiplier) + 400); 
        
        this.data.activityLevel = activityLevel;
        this.data.weight = weight;
        this.data.targetKcal = newTarget;
        this._saveLocal();

        return new Promise(resolve => setTimeout(() => resolve({ targetKcal: newTarget }), 300));
    }

    async toggleMealLike(mealId) {
        const isLiked = this.data.likedMeals.includes(mealId);
        if (isLiked) {
            this.data.likedMeals = this.data.likedMeals.filter(id => id !== mealId);
        } else {
            this.data.likedMeals.push(mealId);
        }
        this._saveLocal();

        return new Promise(resolve => setTimeout(() => resolve(!isLiked), 100));
    }
}

// Controller logic to connect DAO to UI
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Nutrition module loaded.");

    const db = new NutritionDAO();
    
    // UI Elements
    const targetKcalEl = document.getElementById('target-kcal');
    const remainingKcalEl = document.getElementById('remaining-kcal');
    const activityLevelSelect = document.getElementById('activity-level');
    const targetWeightInput = document.getElementById('target-weight');
    const recalcBtn = document.getElementById('recalc-tdee-btn');
    const likeButtons = document.querySelectorAll('.btn-like');
    const burnGoalTextEl = document.getElementById('burn-goal-text');
    const burnGoalBarEl = document.getElementById('burn-goal-bar');

    // Initialization
    async function initUI() {
        const data = await db.getUserNutritionData();
        
        // Populate inputs
        if (activityLevelSelect) activityLevelSelect.value = data.activityLevel;
        if (targetWeightInput) targetWeightInput.value = data.weight;
        
        // Populate stats (no animation on initial load)
        updateStatsUI(data.targetKcal, data.consumedKcal, false);

        // Populate likes
        likeButtons.forEach(btn => {
            const mealId = btn.getAttribute('data-meal-id');
            const icon = btn.classList.contains('like-icon') ? btn : btn.querySelector('.like-icon');
            
            if (data.likedMeals.includes(mealId)) {
                setLikedState(btn, icon, true);
            } else {
                setLikedState(btn, icon, false);
            }
        });
    }

    let currentTarget = 0;
    let currentRemaining = 0;
    let currentPercentage = 0;

    function animateValue(obj, start, end, duration, isPercentage = false) {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic for premium smooth feel
            const ease = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(ease * (end - start) + start);
            
            obj.textContent = isPercentage ? `${currentVal}%` : currentVal.toLocaleString();
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.textContent = isPercentage ? `${end}%` : end.toLocaleString();
            }
        };
        window.requestAnimationFrame(step);
    }

    function updateStatsUI(target, consumed, animate = true) {
        const remaining = Math.max(0, target - consumed);
        const percentage = Math.min(100, Math.round((consumed / target) * 100)) || 0;

        if (animate) {
            animateValue(targetKcalEl, currentTarget, target, 1500);
            animateValue(remainingKcalEl, currentRemaining, remaining, 1500);
            animateValue(burnGoalTextEl, currentPercentage, percentage, 1500, true);
        } else {
            if (targetKcalEl) targetKcalEl.textContent = target.toLocaleString();
            if (remainingKcalEl) remainingKcalEl.textContent = remaining.toLocaleString();
            if (burnGoalTextEl) burnGoalTextEl.textContent = `${percentage}%`;
        }

        if (burnGoalBarEl) {
            burnGoalBarEl.style.transition = animate ? 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
            // Force reflow if we just changed transition
            void burnGoalBarEl.offsetWidth; 
            burnGoalBarEl.style.width = `${percentage}%`;
        }

        currentTarget = target;
        currentRemaining = remaining;
        currentPercentage = percentage;
    }

    function setLikedState(btn, icon, isLiked) {
        if (!icon) return;
        
        if (isLiked) {
            icon.style.fontVariationSettings = "'FILL' 1";
            icon.classList.remove('text-white-50');
            icon.classList.add('text-tertiary');
        } else {
            icon.style.fontVariationSettings = "'FILL' 0";
            icon.classList.remove('text-tertiary');
            icon.classList.add('text-white-50');
        }
    }

    // --- Event Listeners ---

    // Recalculate Button
    if (recalcBtn) {
        recalcBtn.addEventListener('click', async () => {
            const originalText = recalcBtn.textContent;
            recalcBtn.textContent = 'Recalculating...';
            recalcBtn.disabled = true;

            const activityLevel = activityLevelSelect.value;
            const weight = parseFloat(targetWeightInput.value);

            try {
                const result = await db.updateTDEE(activityLevel, weight);
                const currentData = await db.getUserNutritionData();
                updateStatsUI(result.targetKcal, currentData.consumedKcal, true);
            } catch (error) {
                console.error("Failed to update TDEE:", error);
            } finally {
                recalcBtn.textContent = originalText;
                recalcBtn.disabled = false;
            }
        });
    }

    // Like Buttons
    likeButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            // Prevent default behavior if it's an anchor or button inside form
            e.preventDefault(); 
            e.stopPropagation();

            const mealId = btn.getAttribute('data-meal-id');
            const icon = btn.classList.contains('like-icon') ? btn : btn.querySelector('.like-icon');
            
            if (!mealId) return;

            // Optimistic UI update
            const wasLiked = icon.style.fontVariationSettings.includes("'FILL' 1");
            setLikedState(btn, icon, !wasLiked);

            try {
                // Actual DB call
                const isNowLiked = await db.toggleMealLike(mealId);
                // Synchronize UI just in case
                setLikedState(btn, icon, isNowLiked);
            } catch (error) {
                console.error("Failed to toggle like:", error);
                // Revert optimistic update on failure
                setLikedState(btn, icon, wasLiked);
            }
        });
    });

    // Start App
    initUI();
});
