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
            targetKcal: 3025,
            macros: {
                protein: 165,
                carbs: 210,
                fats: 58
            },
            activityLevel: "Elite Athlete (6+ sessions/wk)",
            weight: 82,
            likedMeals: ['meal-2', 'fav-1', 'fav-3'] // Mock some initial liked meals
        };

        this.data = this._loadLocal();
    }

    _loadLocal() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            let parsedData = stored ? JSON.parse(stored) : { ...this.defaultData };

            // Ensure backwards compatibility if macros didn't exist in older storage
            if (!parsedData.macros) {
                parsedData.macros = { ...this.defaultData.macros };
            }

            // Calculate consumedKcal dynamically from stored macros using the intake formula
            parsedData.consumedKcal = (parsedData.macros.protein * 4) + (parsedData.macros.carbs * 4) + (parsedData.macros.fats * 9);
            return parsedData;
        } catch (e) {
            console.error("Local storage error:", e);
            let fallbackData = { ...this.defaultData };
            fallbackData.consumedKcal = (fallbackData.macros.protein * 4) + (fallbackData.macros.carbs * 4) + (fallbackData.macros.fats * 9);
            return fallbackData;
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

    async addMacros(protein, carbs, fats) {
        return new Promise(resolve => {
            setTimeout(() => {
                this.data.macros.protein += protein;
                this.data.macros.carbs += carbs;
                this.data.macros.fats += fats;
                this.data.consumedKcal = (this.data.macros.protein * 4) + (this.data.macros.carbs * 4) + (this.data.macros.fats * 9);
                this._saveLocal();
                resolve({ ...this.data });
            }, 50);
        });
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

    const proteinValEl = document.getElementById('protein-val');
    const carbsValEl = document.getElementById('carbs-val');
    const fatsValEl = document.getElementById('fats-val');
    const macroTotalValEl = document.getElementById('macro-total-val');
    const nutritionBars = document.querySelectorAll('.nutrition-bar-chart > div');

    // Quick Add Elements
    const btnSaveQuickAdd = document.getElementById('btn-save-quick-add');
    const quickAddProtein = document.getElementById('quick-add-protein');
    const quickAddCarbs = document.getElementById('quick-add-carbs');
    const quickAddFats = document.getElementById('quick-add-fats');

    // Initialization
    async function initUI() {
        const data = await db.getUserNutritionData();

        // Populate inputs
        if (activityLevelSelect) activityLevelSelect.value = data.activityLevel;
        if (targetWeightInput) targetWeightInput.value = data.weight;

        // Populate stats (with animation on initial load)
        updateStatsUI(data.targetKcal, data.consumedKcal, true);

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

        // Avoid hardcoded values by grabbing the actual data and defining a calculation function
        const macros = data.macros || { protein: 165, carbs: 210, fats: 58 };
        const calcTotal = (p, c, f) => (p * 4) + (c * 4) + (f * 9);

        // Animate Macros and Total dynamically based on loaded data
        if (proteinValEl) animateValue(proteinValEl, 0, macros.protein, 1500, 'g');
        if (carbsValEl) animateValue(carbsValEl, 0, macros.carbs, 1500, 'g');
        if (fatsValEl) animateValue(fatsValEl, 0, macros.fats, 1500, 'g');
        if (macroTotalValEl) animateValue(macroTotalValEl, 0, calcTotal(macros.protein, macros.carbs, macros.fats), 1500, 'kcal');

        nutritionBars.forEach(bar => {
            const targetHeight = bar.getAttribute('data-target-height');
            if (targetHeight) {
                setTimeout(() => {
                    bar.style.height = targetHeight;
                }, 50); // slight delay to ensure browser paints initial 0% state
            }
        });

        // Interactivity (Time Filters for Nutritional Insights)
        const btnDaily = document.getElementById('btn-daily');
        const btnWeekly = document.getElementById('btn-weekly');
        const btnMonthly = document.getElementById('btn-monthly');

        function setActiveBtn(activeBtn) {
            if (!activeBtn) return;
            [btnDaily, btnWeekly, btnMonthly].forEach(btn => {
                if (btn) btn.classList.remove('active');
            });
            activeBtn.classList.add('active');
        }

        const getVal = el => parseInt(el.textContent.replace(/,/g, '').replace(/[a-zA-Z]/g, '')) || 0;

        if (btnDaily) {
            btnDaily.addEventListener('click', () => {
                setActiveBtn(btnDaily);
                const subtitleEl = document.getElementById('nutrition-subtitle');
                if (subtitleEl) subtitleEl.textContent = 'Detailed breakdown of your daily macro intake and metabolic fuel.';
                animateValue(proteinValEl, getVal(proteinValEl), macros.protein, 1000, 'g');
                animateValue(carbsValEl, getVal(carbsValEl), macros.carbs, 1000, 'g');
                animateValue(fatsValEl, getVal(fatsValEl), macros.fats, 1000, 'g');
                if (macroTotalValEl) animateValue(macroTotalValEl, getVal(macroTotalValEl), calcTotal(macros.protein, macros.carbs, macros.fats), 1000, 'kcal');
            });
        }

        if (btnWeekly) {
            btnWeekly.addEventListener('click', () => {
                setActiveBtn(btnWeekly);
                const subtitleEl = document.getElementById('nutrition-subtitle');
                if (subtitleEl) subtitleEl.textContent = 'Detailed breakdown of your weekly macro intake and metabolic fuel.';
                animateValue(proteinValEl, getVal(proteinValEl), macros.protein * 7, 1000, 'g');
                animateValue(carbsValEl, getVal(carbsValEl), macros.carbs * 7, 1000, 'g');
                animateValue(fatsValEl, getVal(fatsValEl), macros.fats * 7, 1000, 'g');
                if (macroTotalValEl) animateValue(macroTotalValEl, getVal(macroTotalValEl), calcTotal(macros.protein * 7, macros.carbs * 7, macros.fats * 7), 1000, 'kcal');
            });
        }

        if (btnMonthly) {
            btnMonthly.addEventListener('click', () => {
                setActiveBtn(btnMonthly);
                const subtitleEl = document.getElementById('nutrition-subtitle');
                if (subtitleEl) subtitleEl.textContent = 'Detailed breakdown of your monthly macro intake and metabolic fuel.';
                animateValue(proteinValEl, getVal(proteinValEl), macros.protein * 30, 1000, 'g');
                animateValue(carbsValEl, getVal(carbsValEl), macros.carbs * 30, 1000, 'g');
                animateValue(fatsValEl, getVal(fatsValEl), macros.fats * 30, 1000, 'g');
                if (macroTotalValEl) animateValue(macroTotalValEl, getVal(macroTotalValEl), calcTotal(macros.protein * 30, macros.carbs * 30, macros.fats * 30), 1000, 'kcal');
            });
        }
    }

    // Quick Add Event Listener
    if (btnSaveQuickAdd) {
        btnSaveQuickAdd.addEventListener('click', async () => {
            const p = parseInt(quickAddProtein.value) || 0;
            const c = parseInt(quickAddCarbs.value) || 0;
            const f = parseInt(quickAddFats.value) || 0;
            
            // Call API
            await db.addMacros(p, c, f);
            
            // Close Modal
            const modalEl = document.getElementById('quickAddModal');
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }
            
            // Clear inputs
            quickAddProtein.value = '';
            quickAddCarbs.value = '';
            quickAddFats.value = '';
            
            // Re-render UI to animate new values (and default back to Daily view)
            const btnDaily = document.getElementById('btn-daily');
            if (btnDaily) {
                const buttons = document.querySelectorAll('.filter-btn-group .btn');
                buttons.forEach(btn => btn.classList.remove('active'));
                btnDaily.classList.add('active');
            }
            
            initUI();
        });
    }

    let currentTarget = 0;
    let currentRemaining = 0;
    let currentPercentage = 0;

    function animateValue(obj, start, end, duration, format = '') {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic for premium smooth feel
            const ease = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(ease * (end - start) + start);

            const formattedVal = format === '%' ? `${currentVal}%` : format === 'g' ? `${currentVal}g` : format === 'kcal' ? `${currentVal.toLocaleString()}kcal` : currentVal.toLocaleString();
            obj.textContent = formattedVal;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.textContent = format === '%' ? `${end}%` : format === 'g' ? `${end}g` : format === 'kcal' ? `${end.toLocaleString()}kcal` : end.toLocaleString();
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
            animateValue(burnGoalTextEl, currentPercentage, percentage, 1500, '%');
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
