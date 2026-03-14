document.addEventListener('DOMContentLoaded', () => {
    // Use same origin so it works locally and when frontend is served by the same backend
    const API_BASE = window.location.origin;

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
        const message = messageInput.value.trim();

        if (!message && !selectedFile) {
            showToast('Please enter a message or upload a file');
            return;
        }

        sendBtn.disabled = true;
        sendBtn.textContent = 'Connecting...';

        let fetchOptions;
        if (selectedFile) {
            const formData = new FormData();
            if (message) formData.append('message', message);
            formData.append('file', selectedFile);
            fetchOptions = { method: "POST", body: formData };
        } else {
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
            const response = await fetch(`${API_BASE}/api/send`, fetchOptions);
            let data;
            try {
                data = await response.json();
            } catch (_) {
                showToast(response.ok ? 'Invalid response from server' : 'Server error. Try again.');
                return;
            }
            clearTimeout(wakingUpTimer);

            if (data.success) {
                generatedCode.textContent = data.code;
                sendResult.classList.remove('hidden');
                showToast("Content shared successfully!");
                messageInput.value = "";
                fileInput.value = "";
                selectedFile = null;
                fileNameDisplay.textContent = "";
            } else {
                showToast(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Fetch failed:", error);
            showToast("Connection failed. Check your network.");
        } finally {
            clearTimeout(wakingUpTimer);
            sendBtn.disabled = false;
            sendBtn.textContent = "Generate Secret Code";
        }
    });

    // RETRIEVE CONTENT
    retrieveBtn.addEventListener('click', async () => {
        const code = retrieveCodeInput.value.trim().toUpperCase();
        if (!code) {
            showToast("Please enter a code");
            return;
        }

        retrieveBtn.disabled = true;
        retrieveBtn.textContent = "Retrieving...";
        retrieveResult.classList.add('hidden');

        try {
            const response = await fetch(`${API_BASE}/api/retrieve/${code}`);
            let data;
            try {
                data = await response.json();
            } catch (_) {
                showToast(response.ok ? 'Invalid response from server' : 'Content not found or server error.');
                return;
            }

            if (response.ok) {
                renderContent(data);
                retrieveResult.classList.remove("hidden");
            } else {
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
        if (!data || !data.type) return;
        if (data.type === "text") {

            const div = document.createElement("div");
            div.className = "retrieved-text";
            div.textContent = data.content ?? '';
            contentDisplay.appendChild(div);

        } else {
            const fileUrl = `${API_BASE}/uploads/${data.content}`;

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
            const safeName = (() => {
                const d = document.createElement('div');
                d.textContent = data.originalName || 'File';
                return d.innerHTML;
            })();
            downloadLink.innerHTML = `
                <span class="file-icon">${icon}</span>
                <div class="file-info">
                    <strong>${safeName}</strong>
                    <p class="small">Click to download</p>
                </div>
            `;

            contentDisplay.appendChild(downloadLink);

        }

    }

    // Copy code
    copyBtn.addEventListener("click", () => {
        const code = generatedCode.textContent;
        navigator.clipboard.writeText(code)
            .then(() => showToast("Code copied to clipboard!"))
            .catch(() => showToast("Copy failed. Select and copy manually."));
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

