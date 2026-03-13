document.addEventListener('DOMContentLoaded', () => {
    console.log("SecureShare Frontend Initialized");
    // Live API URL (Render backend)
    const API_URL = "https://online-1-ev8d.onrender.com/api/send";
    const BASE_URL = "https://online-1-ev8d.onrender.com";

    let selectedFile = null;

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message');
    const sendResult = document.getElementById('send-result');
    const generatedCode = document.getElementById('generated-code');
    const copyBtn = document.getElementById('copy-btn');
    const retrieveBtn = document.getElementById('retrieve-btn');
    const retrieveCodeInput = document.getElementById('retrieve-code');
    const retrieveResult = document.getElementById('retrieve-result');
    const contentDisplay = document.getElementById('content-display');
    const toast = document.getElementById('toast');

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tabId}-section`).classList.add('active');
        });
    });

    // File selection
    fileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            fileNameDisplay.textContent = `Selected: ${selectedFile.name}`;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    // SEND CONTENT
    sendBtn.addEventListener('click', async () => {
        console.log("Send button clicked");
        const message = messageInput.value.trim();

        if (!message && !selectedFile) {
            showToast('Please enter a message or upload a file');
            return;
        }

        console.log("Targeting API:", `${BASE_URL}/api/send`);
        sendBtn.disabled = true;
        sendBtn.textContent = 'Connecting...';

        let fetchOptions;

        if (selectedFile) {
            // Use FormData for file uploads
            const formData = new FormData();
            if (message) formData.append('message', message);
            formData.append('file', selectedFile);
            
            fetchOptions = {
                method: "POST",
                body: formData
            };
        } else {
            // Use JSON for simple text messages (as requested)
            fetchOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            };
        }

        const wakingUpTimer = setTimeout(() => {
            if (sendBtn.disabled) sendBtn.textContent = 'Waking up server (please wait)...';
        }, 3000);

        try {
            const response = await fetch(API_URL, fetchOptions);

            const data = await response.json();
            clearTimeout(wakingUpTimer);

            if (data.success) {
                console.log("Success! Code:", data.code);
                generatedCode.textContent = data.code;
                sendResult.classList.remove('hidden');
                showToast("Content shared successfully!");

                messageInput.value = "";
                fileInput.value = "";
                selectedFile = null;
                fileNameDisplay.textContent = "";
            } else {
                console.error("API Error:", data.error);
                if (BASE_URL !== "" && response.status >= 500) {
                    showToast("Live Server is currently down. Please run your local backend!");
                } else {
                    showToast("Error: " + data.error);
                }
            }
        } catch (error) {
            console.error("Fetch failed:", error);
            showToast("Connection failed. Check your console (F12).");
        } finally {
            clearTimeout(wakingUpTimer);
            sendBtn.disabled = false;
            sendBtn.textContent = "Generate Secret Code";
        }
    });

    // RETRIEVE CONTENT
    retrieveBtn.addEventListener('click', async () => {
        const code = retrieveCodeInput.value.trim().toUpperCase();
        console.log("Retrieve clicked for code:", code);

        if (!code) {
            showToast("Please enter a code");
            return;
        }

        retrieveBtn.disabled = true;
        retrieveBtn.textContent = "Retrieving...";
        retrieveResult.classList.add('hidden');

        try {
            console.log("Fetching from:", `${BASE_URL}/api/retrieve/${code}`);
            const response = await fetch(`${BASE_URL}/api/retrieve/${code}`);
            const data = await response.json();

            if (response.ok) {
                console.log("Content retrieved successfully");
                renderContent(data);
                retrieveResult.classList.remove("hidden");
            } else {
                console.warn("Retrieve failed:", data.error);
                showToast(data.error || "Content not found");
            }
        } catch (error) {
            console.error("Retrieve error:", error);
            showToast("Connection failed. Check your network.");
        } finally {
            retrieveBtn.disabled = false;
            retrieveBtn.textContent = "Retrieve Content";
        }
    });

    // Render retrieved content
    function renderContent(data) {

        contentDisplay.innerHTML = "";

        if (data.type === "text") {

            const div = document.createElement("div");
            div.className = "retrieved-text";
            div.textContent = data.content;

            contentDisplay.appendChild(div);

        } else {

            const fileUrl = `${BASE_URL}/uploads/${data.content}`;

            if (data.type === "image") {

                const img = document.createElement("img");
                img.src = fileUrl;
                img.className = "image-preview";

                contentDisplay.appendChild(img);
            }

            const downloadLink = document.createElement("a");

            downloadLink.href = fileUrl;
            downloadLink.download = data.originalName;
            downloadLink.className = "file-link";

            const icon = data.type === "image" ? "🖼️" : (data.type === "document" ? "📄" : "📁");

            downloadLink.innerHTML = `
                <span class="file-icon">${icon}</span>
                <div class="file-info">
                    <strong>${data.originalName}</strong>
                    <p class="small">Click to download</p>
                </div>
            `;

            contentDisplay.appendChild(downloadLink);

        }

    }

    // Copy code
    copyBtn.addEventListener("click", () => {

        const code = generatedCode.textContent;

        navigator.clipboard.writeText(code);

        showToast("Code copied to clipboard!");

    });

    // Toast message
    function showToast(msg) {

        toast.textContent = msg;

        toast.classList.add("show");

        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

    }

});

