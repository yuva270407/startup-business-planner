const plansContainer = document.getElementById("plans");

async function loadPlans() {

    try {

        const response = await fetch("/api/business-plans")
        );

        const plans = await response.json();

        if (plans.length === 0) {

            plansContainer.innerHTML = `
                <p>No business plans found.</p>
            `;

            return;
        }

        plansContainer.innerHTML = plans.map(plan => `
            <div class="saved-plan">

                <h2>${plan.startup_name}</h2>

                <p>
                    <strong>Category:</strong>
                    ${plan.category}
                </p>

                <p>
                    <strong>Budget:</strong>
                    ₹${plan.budget}
                </p>

                <p>
                    <strong>Target Customers:</strong>
                    ${plan.customers}
                </p>

                <p>
                    <strong>Created:</strong>
                    ${plan.created_at}
                </p>

                <hr>

                <div>
                    ${plan.business_plan
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br>")
                    }
                </div>

            </div>
        `).join("");

    } catch (error) {

        console.error(error);

        plansContainer.innerHTML = `
            <p>
                Unable to load business plans.
                Please start the backend server.
            </p>
        `;
    }
}

loadPlans();