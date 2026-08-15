const businessForm = document.getElementById("businessForm");
const result = document.getElementById("result");

businessForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const startupName = document.getElementById("startupName").value;
    const idea = document.getElementById("idea").value;
    const category = document.getElementById("category").value;
    const budget = document.getElementById("budget").value;
    const customers = document.getElementById("customers").value;

    result.innerHTML = `
    <div class="ai-loading">
        <div class="loading-orbit">
            <div></div>
            <div></div>
            <div></div>
        </div>

        <h3>AI is analyzing your startup...</h3>
        <p>Preparing your business plan</p>

        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>
`;

    try {
        const response = await fetch("/api/business-plan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                startupName,
                idea,
                category,
                budget,
                customers
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        result.innerHTML = `
            <h2>AI Generated Business Plan</h2>

            <hr>

            <h3>Startup Name</h3>
            <p>${data.startupName}</p>

            <h3>Category</h3>
            <p>${data.category}</p>

            <h3>Available Budget</h3>
            <p>₹${data.budget}</p>

            <h3>Target Customers</h3>
            <p>${data.customers}</p>

            <hr>

            <div class="ai-plan">
                ${formatBusinessPlan(data.businessPlan)}
            </div>
        `;

    } catch (error) {

        console.error(error);

        result.innerHTML = `
            <h3>Error</h3>
            <p>${error.message}</p>
            <p>
                Make sure the backend server is running.
            </p>
        `;
    }
});


function formatBusinessPlan(text) {

    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
}