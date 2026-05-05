document.addEventListener("DOMContentLoaded", function () {
    console.log("Dashboard JS loaded");

    // Load Nutrition Data for the Intake Goal Widget
    const defaultData = {
        targetKcal: 2450,
        macros: { protein: 165, carbs: 210, fats: 58 }
    };
    
    let nutritionData = { ...defaultData };
    try {
        const stored = localStorage.getItem('kinetic_nutrition_data');
        if (stored) {
            nutritionData = JSON.parse(stored);
        }
        if (!nutritionData.macros) {
            nutritionData.macros = { ...defaultData.macros };
        }
        nutritionData.consumedKcal = (nutritionData.macros.protein * 4) + (nutritionData.macros.carbs * 4) + (nutritionData.macros.fats * 9);
    } catch (e) {
        console.error("Error loading nutrition data on dashboard", e);
    }

    const target = nutritionData.targetKcal;
    const consumed = nutritionData.consumedKcal || 0;
    const remaining = Math.max(0, target - consumed);
    const percentage = Math.min(100, Math.round((consumed / target) * 100)) || 0;

    const targetKcalEl = document.getElementById('target-kcal');
    const remainingKcalEl = document.getElementById('remaining-kcal');
    const burnGoalTextEl = document.getElementById('burn-goal-text');
    const burnGoalBarEl = document.getElementById('burn-goal-bar');

    function animateValue(obj, start, end, duration, isPercentage = false) {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
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

    if (targetKcalEl) animateValue(targetKcalEl, 0, target, 1500);
    if (remainingKcalEl) animateValue(remainingKcalEl, target, remaining, 1500);
    if (burnGoalTextEl) animateValue(burnGoalTextEl, 0, percentage, 1500, true);
    if (burnGoalBarEl) {
        setTimeout(() => {
            burnGoalBarEl.style.transition = 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
            burnGoalBarEl.style.width = `${percentage}%`;
        }, 50);
    }
});
